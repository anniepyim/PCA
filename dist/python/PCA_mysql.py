#!/usr/bin/env python

import cgi, os, re, sys
import cgitb;cgitb.enable()
import json
import pandas as pd
import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import scale
import pymysql
#import time

#start_time = time.time()

form = cgi.FieldStorage()
jsons = form.getvalue('jsons')
sampleID = json.loads(jsons)
sessionid = form.getvalue('sessionid')
organism = form.getvalue('organism')
host = form.getvalue('host')
port = form.getvalue('port')
user = form.getvalue('user')
passwd = form.getvalue('passwd')
unix_socket = form.getvalue('unix_socket')

#sampleID = {'group1':['HCT116-21-3-c1', 'HCT116-21-3-c3', 'HCT116-5-4', 'HCT116-5-4-p'],'group2':['HCT116-8-3-c3', 'HCT116-8-3-c4', 'RPE-21-3-c1', 'RPE-21-3-c1-p','RPE-21-3-c2', 'RPE-5-3-12-3-p']}
#organism = 'Human'
#sessionid = 'test'
#host = "localhost"
#port = 3306
#user = "root"
#passwd = ""
#unix_socket = "/tmp/mysql.sock"

grouping = pd.DataFrame()
isGroup = isinstance(sampleID, dict)

if (isGroup):
    for group in sampleID:
        grouping_tmp = pd.DataFrame(np.array(sampleID[group]), columns = ["sampleID"])
        grouping_tmp['group'] = group
        if grouping.empty:
            grouping = grouping_tmp
        else:
            grouping = pd.concat([grouping,grouping_tmp])
    
    grouping.drop_duplicates(subset='sampleID', keep="first")
    sampleID = grouping['sampleID']
    
#connecting to mysql database
conn = pymysql.connect(host=host, port=port, user=user, passwd=passwd, db=organism, unix_socket=unix_socket)
query = 'SELECT sampleID, gene, log2 FROM target_exp WHERE sampleID in ('+','.join(map("'{0}'".format, sampleID))+') AND userID in ("mitox","'+sessionid+'")'
main = pd.read_sql(query, con=conn)
query = 'SELECT sampleID, folder FROM file_directory WHERE sampleID in ('+','.join(map("'{0}'".format, sampleID))+') AND userID in ("mitox","'+sessionid+'")'
file_directory = pd.read_sql(query, con=conn)
query = 'SELECT gene, process from target'
genefunc = pd.read_sql(query, con=conn)
conn.close()

#main.loc[main.log2 > 10, 'log2'] = 10
#main.loc[main.log2 < -10, 'log2'] = -10

file_directory.rename(columns={'folder':'project'},inplace=True)
if (len(file_directory['project'].unique()) == 1):
    filetype = file_directory['project'].iloc[0]
else:
    filetype = "none"

try:
    typefile = pd.read_csv("../main_files/filetype.txt",sep="\t")
    typeurl = typefile['file'][typefile['filetype'] == filetype].values[0]
    info = pd.read_csv(typeurl,sep="\t")
except:
    info = pd.DataFrame()

main = main.pivot(index='gene',columns='sampleID',values='log2')
main.reset_index(inplace=True)
main = pd.merge(genefunc,main,on="gene",how='inner')
main.dropna(inplace=True,thresh=(len(main.columns)-2)*0.7,axis=0)
main.fillna(0,inplace=True)

#Perform PCA for all genes
allmito = main[main.columns[2:]].transpose().reset_index()
X = np.array(allmito.drop(['index'],1))
y = np.array(allmito['index'])

pca = PCA(n_components=3)
pca.fit(X)
X = pca.transform(X)

pcadf = pd.DataFrame(X,columns=['PC1','PC2','PC3'],index=y).reset_index()
pcadf.rename(columns={'index': "sampleID"}, inplace=True)

if info.empty == False:
    pcadf = pd.merge(pcadf,info,on='sampleID',how='inner')
else:
    pcadf = pd.merge(pcadf,file_directory,on='sampleID',how='inner')
if grouping.empty == False:
    pcadf = pd.merge(pcadf,grouping,on='sampleID',how='inner')
    
pcadf['filetype'] = filetype
    
pcadict = pcadf.to_dict(orient='records')
pcadf = pcadf.to_json(orient='records')

cmd = "rm -R ../data/user_uploads/" + ''.join(sessionid) + "/PCA/*"
os.system(cmd)

with open('../data/user_uploads/'+''.join(sessionid)+'/PCA/All Processes-pca.json', 'w') as fp:
    json.dump(pcadict,fp)

#Perform PCA for each process
mitoproc = main['process'].unique()

for proc in mitoproc:
    subset = main[main['process']==proc]
    if (subset.shape[0] > 3):
        subset = subset[subset.columns[2:]].transpose().reset_index()
        X = np.array(subset.drop(['index'],1))
        y = np.array(subset['index'])

        #Scaling the values
        #X = scale(X)

        pca = PCA(n_components=3)
        pca.fit(X)
        X = pca.transform(X)

        pcadf2 = pd.DataFrame(X,columns=['PC1','PC2','PC3'],index=y).reset_index()
        pcadf2.rename(columns={'index': "sampleID"}, inplace=True)

        if info.empty == False:
            pcadf2 = pd.merge(pcadf2,info,on='sampleID',how='inner')
        else:
            pcadf2 = pd.merge(pcadf2,file_directory,on='sampleID',how='inner')
        if grouping.empty == False:
            pcadf2 = pd.merge(pcadf2,grouping,on='sampleID',how='inner')
            
        pcadf2['filetype'] = filetype
        
        pcadict2 = pcadf2.to_dict(orient='records')
        with open('../data/user_uploads/'+''.join(sessionid)+'/PCA/'+''.join(proc)+'-pca.json', 'w') as fp:
            json.dump(pcadict2,fp)


print 'Content-Type: application/json\n\n'
print (pcadf)