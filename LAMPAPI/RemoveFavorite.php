<?php
$inData = json_decode(file_get_contents('php://input'), true);

$contactId = $inData["contactId"];

$conn = new mysqli("localhost", "DBuser", "passwordpassword", "CONTACTS_DB");

$stmt = $conn->prepare("UPDATE User_Contacts SET Favorite = 0 WHERE ID = ?");
$stmt->bind_param("i", $contactId);
$stmt->execute();
$stmt->close();
$conn->close();

echo json_encode(["status" => "success"]);
?>
