# SupFiles v0.1.0

API Documentation

- [Auth](#auth)
	- [Login with Google authentication](#login-with-google-authentication)
	- [Login with email](#login-with-email)
	- [Register with email](#register-with-email)
	
- [File](#file)
	- [Download video to stream it](#download-video-to-stream-it)
	- [Create a folder](#create-a-folder)
	- [Download a file or a folder](#download-a-file-or-a-folder)
	- [Get user&#39;s folder size](#get-user&#39;s-folder-size)
	- [Move a file or a folder in another folder](#move-a-file-or-a-folder-in-another-folder)
	- [Move a file or a folder back in the parent folder](#move-a-file-or-a-folder-back-in-the-parent-folder)
	- [Remove a file or a folder](#remove-a-file-or-a-folder)
	- [Rename a file or a folder](#rename-a-file-or-a-folder)
	- [Share a file or a folder](#share-a-file-or-a-folder)
	- [Get shared files](#get-shared-files)
	- [Upload files](#upload-files)
	
- [User](#user)
	- [Confirm user&#39;s email](#confirm-user&#39;s-email)
	- [Retrieve current user](#retrieve-current-user)
	- [Update user](#update-user)
	


# Auth

## Login with Google authentication



	POST /auth/googleLogin


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| email			| String			|  <p>Google's email of the user.</p>							|

## Login with email



	POST /auth/login


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| email			| String			|  <p>Email of the user.</p>							|
| password			| String			|  <p>Password of the user.</p>							|

## Register with email



	POST /auth/register


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| firstname			| String			|  <p>First name of the user.</p>							|
| lastname			| String			|  <p>Last name of the user.</p>							|
| email			| String			|  <p>Email of the user.</p>							|

# File

## Download video to stream it



	GET /file/video

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization			| String			|  <p>User unique token.</p>							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| userFolder			| String			|  <p>The user's personal folder which contains every of his files &amp; folders.</p>							|
| path			| String			|  <p>Current folder in which the user is.</p>							|
| videoName			| String			|  <p>The video's name to download.</p>							|

## Create a folder



	POST /file/newFolder

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization			| String			|  <p>User unique token.</p>							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| userFolder			| String			|  <p>The user's personal folder which contains every of his files &amp; folders.</p>							|
| path			| String			|  <p>Current folder in which the user is.</p>							|
| folderName			| String			|  <p>The folder's name to create.</p>							|

## Download a file or a folder



	GET /file/download

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization			| String			|  <p>User unique token.</p>							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| userFolder			| String			|  <p>The user's personal folder which contains every of his files &amp; folders.</p>							|
| path			| String			|  <p>Current folder in which the user is.</p>							|
| filename			| String			|  <p>The file's name to download.</p>							|

## Get user&#39;s folder size



	GET /file/folderSize

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization			| String			|  <p>User unique token.</p>							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| userFolder			| String			|  <p>The user's personal folder which contains every of his files &amp; folders.</p>							|

## Move a file or a folder in another folder



	POST /file/move

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization			| String			|  <p>User unique token.</p>							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| userFolder			| String			|  <p>The user's personal folder which contains every of his files &amp; folders.</p>							|
| path			| String			|  <p>Current folder in which the user is.</p>							|
| sourceFile			| String			|  <p>The file/folder's name to move.</p>							|
| destinationFile			| String			|  <p>The folder in which the user tries to move his file/folder.</p>							|

## Move a file or a folder back in the parent folder



	POST /file/moveBackInFolder

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization			| String			|  <p>User unique token.</p>							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| userFolder			| String			|  <p>The user's personal folder which contains every of his files &amp; folders.</p>							|
| path			| String			|  <p>Current folder in which the user is.</p>							|
| sourceFile			| String			|  <p>The file/folder's name to move.</p>							|
| destinationFile			| String			|  <p>The folder in which the user tries to move his file/folder.</p>							|

### Examples

For example

```
home
  |-- test
  |-- toto
        |-- textFile.txt
        |-- otherRandomFile.txt

if you use this function on the file textFile.txt (which is in folder toto),
it will puts it back in the folder below in folder`s tree which is home.

result :

home
  |-- test
  |-- toto
  |     |-- otherRandomFile.txt
  |-- textFile.txt
```

## Remove a file or a folder



	POST /file/remove

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization			| String			|  <p>User unique token.</p>							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| userFolder			| String			|  <p>The user's personal folder which contains every of his files &amp; folders.</p>							|
| path			| String			|  <p>Current folder in which the user is.</p>							|
| filename			| String			|  <p>The file/folder's name to remove.</p>							|

## Rename a file or a folder



	POST /file/rename

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization			| String			|  <p>User unique token.</p>							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| userFolder			| String			|  <p>The user's personal folder which contains every of his files &amp; folders.</p>							|
| path			| String			|  <p>Current folder in which the user is.</p>							|
| filename			| String			|  <p>The file/folder's name to rename.</p>							|
| newFileName			| String			|  <p>The new file/folder's name.</p>							|

## Share a file or a folder



	POST /file/shared

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization			| String			|  <p>User unique token.</p>							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| userFolder			| String			|  <p>The user's personal folder which contains every of his files &amp; folders.</p>							|
| path			| String			|  <p>Current folder in which the user is.</p>							|
| filename			| String			|  <p>The file/folder's name to share.</p>							|

## Get shared files



	GET /file/getSharedFile/:id


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| userFolder			| String			|  <p>The user's personal folder which contains every of his files &amp; folders.</p>							|
| path			| String			|  <p>Current folder in which the user is.</p>							|
| id			| String			|  <p>Link unique ID.</p>							|

## Upload files



	POST /file/upload

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization			| String			|  <p>User unique token.</p>							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| postFormData			| Object[]			|  <p>The files that'll be uploaded to server.</p>							|
| userFolder			| String			|  <p>The user's personal folder which contains every of his files &amp; folders.</p>							|
| path			| String			|  <p>Current folder in which the user is.</p>							|

# User

## Confirm user&#39;s email



	POST /users/confirmEmail


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| hash			| String			|  <p>Unique hash that have been sent to user's mailbox.</p>							|

## Retrieve current user



	GET /users/me

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization			| String			|  <p>User unique token.</p>							|

## Update user



	PUT /users/:id

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization			| String			|  <p>User unique token.</p>							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| id			| String			|  <p>User unique ID.</p>							|


