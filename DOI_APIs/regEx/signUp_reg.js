const reg = {
    "email_reg":"^[a-zA-Z0-9.%_-]+@[a-zA-Z0-9.-_]+\.[a-zA-Z]{2,}$"
}

module.exports = {
    emailReg:() => reg.email_reg
}