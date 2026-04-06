<?php

$inData = getRequestInfo();

$userId = $inData["userId"];

$conn = new mysqli("localhost", "DBuser", "passwordpassword", "CONTACTS_DB");

if ($conn->connect_error) 
{
    returnWithError($conn->connect_error);
} 
else
{
    $stmt = $conn->prepare("SELECT ID, FirstName, LastName, Phone, Email, Favorite FROM User_Contacts WHERE UserID=?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();

    $result = $stmt->get_result();

    $searchResults = [];

    while($row = $result->fetch_assoc())
    {
        $searchResults[] = $row;
    }

    sendResultInfoAsJson(json_encode(["results"=>$searchResults]));

    $stmt->close();
    $conn->close();
}

function getRequestInfo()
{
    return json_decode(file_get_contents('php://input'), true);
}

function sendResultInfoAsJson($obj)
{
    header('Content-type: application/json');
    echo $obj;
}
?>