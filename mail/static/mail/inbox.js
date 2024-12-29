document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').addEventListener('submit', e => {
    e.preventDefault()
    sendmail()

  })

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  getMails(mailbox)

}


function load_single_mail() {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#email-view').innerHTML = ''

}

function sendmail() {
  const recipients = document.querySelector('#compose-recipients').value
  const subject = document.querySelector('#compose-subject').value
  const body = document.querySelector('#compose-body').value


  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
        if (result.error) {
          alert(result.error)
        }else {
          load_mailbox('sent')
        }
        
  })
  

}


function getMails(mailbox) {
  const mailView = document.querySelector('#emails-view')

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      emails.forEach(email => {

        const emailContainerDiv = document.createElement('div')
        const sender = document.createElement('p')
        const emailContentDiv = document.createElement('div')
        const emailSubject = document.createElement('p')
        const emailTimeStamp = document.createElement('p')

        emailContainerDiv.classList.add('email-container')
        sender.classList.add('sender')
        emailContentDiv.classList.add('email-content')
        emailSubject.classList.add('email-subject')
        emailTimeStamp.classList.add('email-time')


        emailContainerDiv.append(sender)
        emailContentDiv.append(emailSubject)
        emailContentDiv.append(emailTimeStamp)
        emailContainerDiv.append(emailContentDiv)
        
       sender.textContent = email.sender
       emailSubject.textContent = email.subject
       emailTimeStamp.textContent = email.timestamp

       emailContainerDiv.addEventListener('click',() => {
        const isSentMailbox = mailbox === 'sent' ? true : false;
        viewEmail(email, isSentMailbox)
       })

       if (email.read === false) {
        emailContainerDiv.style.backgroundColor = "lightgray";

       }
       mailView.append(emailContainerDiv)



      })

  });

}

function viewEmail(email, isSentMailbox) {
  load_single_mail()

  const emailSinglePage = document.querySelector('#email-view')

  const from = document.createElement('p')
  const to = document.createElement('p')
  const subject = document.createElement('p')
  const timestamp = document.createElement('p')
  const replyBtn = document.createElement('button')
  const archiveBtn = document.createElement('button')
  const body = document.createElement('p')
  const hr = document.createElement('hr')

  console.log(email.body)

  from.innerHTML = `<strong>From:</strong>${email.sender}`
  to.innerHTML = `<strong>To:</strong>${email.recipients}`
  subject.innerHTML = `<strong>Subject:</strong>${email.subject}`
  timestamp.innerHTML = `<strong>Timestamp:</strong>${email.timestamp}`
  replyBtn.textContent = "Reply"
  
  replyBtn.classList.add('btn', 'btn-sm','btn-outline-primary', 'mr-3')
  archiveBtn.classList.add('btn', 'btn-sm','btn-outline-primary')
  body.innerHTML = email.body.replace(/\n/g, "<br>")



  replyBtn.addEventListener('click', () => {
    compose_email()

    const recipients = document.querySelector('#compose-recipients')
    const subject = document.querySelector('#compose-subject')
    const body = document.querySelector('#compose-body')

    recipients.value = email.sender
    if (email.subject.startsWith('Re: ')) {
      subject.value = email.subject
    }else {
      subject.value = `Re: ${email.subject}`
    }
    
    const space = '\n\n\n\n'
    body.value = `${space}On ${email.timestamp} ${email.sender} wrote: ${email.body}`

  })


  if (email.archived === false) {
    archiveBtn.textContent = "Archive"
  } else {
    archiveBtn.textContent = "Unarchive"
  }

  archiveBtn.addEventListener('click', () => {

    if (email.archived === false) {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: true
        })
      })

      archiveBtn.textContent = "Unarchive"
    } else {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: false
        })
      })

      archiveBtn.textContent = "Archive"
    }
  })

  if (isSentMailbox === false) {
    emailSinglePage.append(from, to, subject, timestamp, replyBtn, archiveBtn, hr, body)
  } else {
    emailSinglePage.append(from, to, subject, timestamp, replyBtn, hr, body)
  }

  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })


}