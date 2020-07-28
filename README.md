# Sitemap

## Account crtl

```
/api/account/register by POST
req: id, password, name, phoneNumber, macAddress, gender
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

```
/api/account/findUser - by GET
req: macAddress
res: userID, userName
```

```
/api/account/updateProfile - by POST
req: id, age, height, job, hobby, smoke, drink, self_instruction, school, major
res: boolean
```

```
/api/account/downloadProfile - by GET
req: id
res: userName, age, region, height, job, hobby, smoke, drink, self_instruction
```

```
/api/account/getLike - by GET
req: id
res: friendID array, friendName array
```

```
/api/account/getStar - by GET
req: id
res: score
```

```
/api/account/getTodayProbability - by GET
req: id
res: probability
```

```
/api/account/getMatch - by GET
req: id
res: friendID array, friendName array, intimacyScore array, phoneNumber array
```

## Friends crtl

```
/api/friend/addContact - by POST
req: id, friendID, contactID, position, contactTime, date
res: intimacyScore
```

```
/api/friend/getIntimacy - by GET
req: id, friendID
res: intimacyScore, contactTime: array<number>, continueTime: array<number>
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

```
/api/friend/getContactID - by GET
req: id, friendID, date
res: contactID
```

```
/api/friend/sendLike - by POST
req: id, friendID,
res: boolean
```

```
/api/friend/sendStar - by POST
req: id, score
res: score
```

```
/api/friend/getTodayFriend - by GET
req: id, date
res: friendId array, friendName array position array of array, intimacyScore array, contactTime array of array
```

```
/api/friend/registerMatch - by PUT
req: id, friendID
res: boolean
```

```
/api/friend/deleteLike - by DELETE
req: id, friendID
res: None
```

## Image crtl

```
/api/image/uploadProfile - by POST
req: id, imageKind
res: boolean
```

```
/api/image/downloadProfile - by GET
req: id, imageKind
res: image binary
```
