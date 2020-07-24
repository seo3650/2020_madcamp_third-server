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
/api/friend/addContact - by POST
req: id, friendID, contactTime, continueTime
res: boolean
```

```
/api/friend/getIntimacy - by GET
req: id, friendID   
res: intimacyScore, contactTime: array<number>, continueTime: arra<number>
```

```
/api/friend/addBlockUser - by PUT
req: id, blockUserId
res: blockUserId
```

```
/api/friend/deleteBlockUser - by DELETE
req: id, unblockUserId
res: blockUserId
```
## Image crtl
```
/api/image/uploadProfile - by POST
req: id, imageKind
res: boolean
```

```
/api/image/downloadProfile - by GET
req: id
res: image binary
```