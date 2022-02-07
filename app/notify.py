import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import datetime

class Notification:
    email_sender_account = "classicnailzja@gmail.com" #company email
    email_sender_username = "classicnailzja"  #company email username
    email_sender_password = "sch3dul32021"#company email password
    email_smtp_server = "smtp.gmail.com" 
    email_smtp_port = 587

    def __init__ (email_type,email_recepient,custName,apptDate,apptTime,apptID,time):
        self.email_type = email_type
        self.email_recepient = email_recepient
        self.custName = custName
        self.apptDate = apptDate
        self.apptTime = apptTime
        self.apptID =  apptID
        self.time =  time

    def notifyOfNewAppointment(self):
        if self.email_type=="book":
            email_subject = f"You Have Successfully Booked Your Appointment at Classic Nailz Ja"
            email_body = '<html><head></head><body>'
            email_body += '<style type="text/css"></style>' 
            email_body += f'<h2>Classic Nailz Ja - Booked Appointment at {self.time}</h2>' 
        
            email_body += f'<p style="color: rgb(0, 0, 0);">' 
            email_body += f'<br>Dear {self.custName}, ' 
            email_body += f'<br>'
            email_body += f'<br>This is to confirm that your appointment has been booked for {self.apptDate} at {self.apptTime}.'
            email_body += f'<br>Your appointment ID# is {self.apptID}.'
            email_body += f'<br>'
            email_body += f'<br>Thank You for making it Classic Nailz Ja.</p>'   
        
            #footer
            email_body += '<br>' 
            email_body += '<br>This is an automated message by Classic Nailz JA.'
            email_body += '<br>Do not reply!</body></html>'

        server = smtplib.SMTP(email_smtp_server,email_smtp_port) 
        print(f"Logging in to {email_sender_account}")
        server.starttls() 
        server.login(email_sender_username, email_sender_password)
        for recipient in self.email_recepient:
            print(f"Sending email to {recipient}")
            message = MIMEMultipart('alternative') 
            message['From'] = email_sender_account 
            message['To'] = recipient 
            message['Subject'] = email_subject 
            message.attach(MIMEText(email_body, 'html')) 
            server.sendmail(email_sender_account,recipient,message.as_string())
        server.quit()

    def notifyOfNewAccount(self):
        if self.email_type=="account":
            email_subject = f"You Have Successfuly Created a New Customer Account at Classic Nailz Ja"
            email_body = '<html><head></head><body>'
            email_body += '<style type="text/css"></style>' 
            email_body += f'<h2>Classic Nailz Ja - New Account Created at {self.time}</h2>' 
        
            email_body += f'<p style="color: rgb(0, 0, 0);">' 
            email_body += f'<br>Dear {self.custName}, ' 
            email_body += f'<br>'
            email_body += f'<br>This is to confirm that your acount was successfully created. Welcome to the Classic Nailz Family where you can give your nails'
            email_body += f'<br> a sweet treat. Trust us, your nails will thank you for it!'
            email_body += f'<br>'
            email_body += f'<br>Thank You for making it Classic Nailz Ja.</p>'   
        
            #footer
            email_body += '<br>' 
            email_body += '<br>This is an automated message by Classic Nailz JA.'
            email_body += '<br>Do not reply!</body></html>'

        
        server = smtplib.SMTP(email_smtp_server,email_smtp_port) 
        print(f"Logging in to {email_sender_account}")
        server.starttls() 
        server.login(email_sender_username, email_sender_password)
        for recipient in self.email_recepient:
            print(f"Sending email to {recipient}")
            message = MIMEMultipart('alternative') 
            message['From'] = email_sender_account 
            message['To'] = recipient 
            message['Subject'] = email_subject 
            message.attach(MIMEText(email_body, 'html')) 
            server.sendmail(email_sender_account,recipient,message.as_string())
        server.quit()

