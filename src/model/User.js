export class User {
    constructor(id, firstName, username, password, sex, role, avatar, summary, active, registrationDateTime, lastModificationDateTime) {
        this.id = id;
        this.firstName = firstName;
        this.username = username;
        this.password = password;
        this.sex = sex;
        this.role = role;
        this.avatar = avatar;
        this.summary = summary;
        this.active = active;
        this.registrationDateTime = registrationDateTime;
        this.lastModificationDateTime = lastModificationDateTime;
    }
}