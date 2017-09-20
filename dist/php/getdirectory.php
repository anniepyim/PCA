<?php
if(isset($_POST['folderurl']))
{
    $uid = $_POST['folderurl'];

    $filenameArray = array();
    $handle = opendir($uid);
    while($file = readdir($handle)){
        if($file !== '.' && $file !== '..' && $file !== '.DS_Store' && !strpos($file,'files')){
            array_push($filenameArray, $file);
        }
    }
    
    echo json_encode($filenameArray);
}

//
?>  