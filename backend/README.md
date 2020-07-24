# Sitemap
## Account crtl
```
/api/account/register by POST
req: id, password, name, phoneNumber   
res: userID
```

```
/api/account/login - by POST
req: id, password  
res: userID, name
```

```
/api/account/delete - by DELTE
req: id, password
res: message
```


## Friends crtl
```
/api/friend/register
req: name, contactTime
```

```
/api/friend/getUser - 
req: userName, friendName   
res: contactNumber, contactTime
```

```
/api/friend/addBlockUser - by PUT
req: id, blockUserId
res: blockUserId
```
```
/api/friend/deleteBlockUser - by DELETE
req: id, blockUserId
res: blockUserId
```
## 