# Set up MitoX for Mac OS X

You will have to set up your local server and MySQL in order for MitoXplorer to work on your own machine. If you have already set upboth of them, skip to "Set up MitoX" directly.

## Set up your local server

**1. Uncomment following lines in /etc/apache2/httpd.conf**
 
    LoadModule include_module libexec/apache2/mod_include.so  
    LoadModule cgi_module libexec/apache2/mod_cgi.so  
    LoadModule userdir_module libexec/apache2/mod_userdir.so  
    LoadModule rewrite_module libexec/apache2/mod_rewrite.so  
    LoadModule php5_module libexec/apache2/libphp5.so  
 
    Include /private/etc/apache2/extra/httpd-userdir.conf 


**2. Uncomment following line in /etc/apache2/extra/httpd-userdir.conf** 
 
    Include /private/etc/apache2/users/*.conf 
  

**3. Create personal config file /etc/apache2/users/(your user name).conf** 
 
    <Directory "/Users/(your user name)/Sites/"> 
        AddLanguage en .en
        Options Indexes MultiViews
        AllowOverride None
        Order allow,deny
        Allow from localhost
        Require all granted
    </Directory> 
  
   
**4. Create Sites folder (if you computer doesn't already have one), and then html and php under this folder for testing** 

To create Sites folder:
    
    mkdir ~/Sites
    
To create index.html and info.php:
    
    echo "<html><body><h1>My site works</h1></body></html>" > ~/Sites/index.html   
    echo "<?php echo phpinfo(); ?>" > ~/Sites/info.php
 
**5. (Re)Start apache webserver and test configuration** 
 
    sudo apachectl start | restart

**6. Now you could test if the local server is set up successfully**

To test the html and php page go to:

    http://localhost/~(your user name)
    http://localhost/~(your user name)/info.php 
 
**Also visit https://discussions.apple.com/docs/DOC-3083 for installation steps of your MacOS**



## Set up MySQL database

Simply download the MySQL **"DMG Archive"** from [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/) and install it according to the instructions. Then export the path for MySQL so it could be accessed anywhere at the Terminal

    export PATH=${PATH}:/usr/local/mysql/bin/



## Set up MitoX
 
**1. Clone the mitoX project from the repository in ~/Sites/ (You need to provide your user name and password)** 
	
    cd ~/Sites
    git clone git@gitlab.mpcdf.mpg.de:ext-e67ca6c3aa6a/MitoX2.git


**2. Install all the python libraries needed**
	
    cd MitoX2/dist/R
    python setup.py
	
	
**3. Add the following lines to /etc/apache2/users/(your user name).conf to allow Python cgi wrapper script execution and restart apache** 
    
    <Directory "/Users/(your user name)/Sites/MitoX2/">
       Order allow,deny
       Allow from all
       Options ExecCGI
       Addhandler cgi-script .py
    </Directory>

To restart apache: 
    
    sudo apachectl restart
    

**4. Import MySQL database**

Change directory to the folder below and start mysql (you have to log in as root user and make sure it's already running - simply check the MySQL Panel at System Preference):

    cd ~/Sites/MitoX2/dist/mysql/
    mysql -u root -p

**Inside MySQL:**
    
    mysql> source Human.sql
    
**Quit MySQL and update the information of the config file (~/Sites/MitoX2/dist/mysql/mysql_info.json) if necessary**

To check your port number and socket:
    
    mysqladmin -u root -p variable | grep port
    mysqladmin -u root -p variable | grep socket
    
    
**5. Allow files to be uploaded to user_uploads folder**
    
    Change the rights of the folder:
    chmod o+w ~/Sites/MitoX2/dist/data/user_uploads/
    
    Or change the ownership to _www (the web server):
    1) Add yourself to the _www:
        sudo dseditgroup -o edit -a (your username) _www
    2) Change the ownership:
        sudo chown _www ~/Sites/MitoX2/dist/data/user_uploads/
 
 
**5. Test if everything is working fine**

To test Python cgi and MySQL database connection:
    
    http://localhost/~(your user name)/MitoX2/dist/R/test.py

If there's an error check the apache error log:
    
    sudo tail /var/log/apache2/error_log
    
To test the visualization tool go to: 

    http://localhost/~(your user name)/MitoX2/dist/compare.php
    
To test the upload function go to:

    http://localhost/~(your user name)/MitoX2/dist/upload.html

Sample files are located at:

	~/Sites/MitoX2/dist/data/zzraw_files/aneuploidy/HCT116-5-4_newexp.csv (expression)
	~/Sites/MitoX2/dist/data/zzraw_files/aneuploidy/HCT116-5-4_newmut.csv (mutation)
	


## Setup for Linux

1. Install apache2, php, libapache2-mod-php, python2.7, python-pandas, python-mpld3, python-sklearn, python-seaborn version 0.7.1, python-matplotlib, python-jinja2,  
2. Activate modules 

	a2enmod cgi
	a2enmod userdir
	a2enmod rewrite
	a2emmod php7
	systemctl apache2 restart

3. Activate cgi to execute python and R scripts
	In /etc/apache2/mods-available/mime/conf
	Uncomment line cgi-script and add the file extensions for python, perl or R
	
	AddHandler cgi-script .cgi .py 
	
	(.pl .R scripts not needed anymore)

4. Add mitox.com.conf file from MitoX2 repo to the /etc/apache2/sites-enabled directory.
5. Delete the old symbolic link of original default config if necessary, for example :
	
	sudo a2dissite 000-default
	sudo systemctl reload apache2	

6. Enable the new mitox website
	
	sudo a2ensite mitox.com
	sudo systemctl reload apache2

7. Give the rights to read, write and execute the user_uploads directory under MitoX2/data to user www-data. 
