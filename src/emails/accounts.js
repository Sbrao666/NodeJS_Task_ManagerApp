const sgMail = require("@sendgrid/mail")
sgMail.setApiKey(process.env.SENDGRID_API_KEY)


const userWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "sbrao666@gmail.com",
        subject: `Thank you for joining in...!`,
        text: `Welcome to the task-manager app, ${name} we are happy to serve to you.`
    })
}

const userDeleteEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "sbrao666@gmail.com",
        subject: `Sorry to see you go...!`,
        text: `Good Bye....!\n\t\t${name}, I hope we will see you back in sometime soon.`
    })
}

module.exports = {
    userWelcomeEmail,
    userDeleteEmail
}


