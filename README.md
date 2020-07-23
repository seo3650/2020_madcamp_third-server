# Sitemap
## Account crtl
```
/account/register
```
req: userID, userPW, Phone   
res: boolean
```
/account/login - login by POST
```
req: userID, userPW   
res: boolean
```
/account/delete - delete account by POST
```
req: userID   
res: boolean

## FriendsI crtl
```
/friend/register
```
req: name, contactTime
```
/friend/getUser - 
```
req: userName, friendName   
res: contactNumber, contactTime
## 

# Database
## Account
id, pw, phone, friend array
## Friend
[
       
    {   
        friendName,   
        contactNumber,   
        contactTime,   
    }   
]