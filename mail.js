// mail.js - Outlook Express 98 / Revenue Mail Express
// Authentic 90s state agency email client with folders, emails, and bureaucratic reply templates.

(function() {
    'use strict';

    class RetroMailApp {
        constructor() {
            this.currentFolder = 'inbox';
            this.activeEmailId = 1;

            this.emails = [
                {
                    id: 1,
                    folder: 'inbox',
                    from: 'Director Eugene Vance <vance@irs.internal>',
                    subject: '[URGENT] Missing 3x red ballpoint pens from supply cabinet',
                    date: 'Today 15:42',
                    size: '2 KB',
                    read: false,
                    body: `TO ALL INTERNAL EXAMINERS (DESKS 1-A THROUGH 24-C):

It has come to my personal attention that between 11:30 AM and 12:15 PM, THREE (3) Pilot G-2 red ballpoint pens disappeared from the central locked supply cabinet.

These pens are government property procured under Federal Requisition Batch #94-B. Red ink is exclusively reserved for issuing Section 36 penalty assessments!

Arthur, Desk 14-B is directly adjacent to the supply closet. If you do not have Form 1040 itemized deductions balanced by 5:00 PM, I will be conducting a personal inspection of your desk drawers for stolen stationery.

Eugene Vance
Executive Director of Internal Compliance`
                },
                {
                    id: 2,
                    folder: 'inbox',
                    from: 'Director Eugene Vance <vance@irs.internal>',
                    subject: 'RE: Breakroom Microwave Odor Protocol (ENFORCEMENT)',
                    date: 'Today 14:10',
                    size: '3 KB',
                    read: false,
                    body: `EFFECTIVE IMMEDIATELY:

Reheating mackerel, sardines, or aged cabbage in the 2nd-floor breakroom microwave is strictly prohibited under Departmental Sanitation Ordinance 114.

Whoever reheated smoked kippers at 1:45 PM today has contaminated the ventilation shaft for the entire East Wing. Senior auditors reviewing Schedule-C filings are feeling nauseous.

Future infractions will result in the immediate revocation of CD-ROM cup holder privileges (Coffee.exe).

- Dir. Vance`
                },
                {
                    id: 3,
                    folder: 'inbox',
                    from: 'Departmental HR <hr-compliance@irs.internal>',
                    subject: 'Mandatory 4-hour Seminar: ISO-9002 Paperclip Alignment',
                    date: 'Today 11:05',
                    size: '5 KB',
                    read: false,
                    body: `Dear Employee Pendelton (Desk 14-B),

You have been enrolled in the mandatory compliance module:
"Standardized Fastener Application: Aligning the 24/6 Paperclip with Federal Document Margins".

Course Duration: 4 Hours (Uncredited).
Date: Next Monday, 8:00 AM sharp.
Attendance is compulsory. Please bring your own notepad and non-stolen ballpoint pen.`
                },
                {
                    id: 4,
                    folder: 'inbox',
                    from: 'Bob Miller (Desk 12-A) <bob12a@irs.internal>',
                    subject: 'Did you take my ergonomic lumbar support cushion?',
                    date: 'Today 09:30',
                    size: '1 KB',
                    read: true,
                    body: `Arthur,

Someone swapped my blue memory foam ergonomic chair cushion with a flat burlap sack filled with 1991 municipal tax brochures. 

My sciatica is flaring up and I can barely sit through the 1040 audits. If you have it, please return it before Vance walks through at 4:30.

Bob`
                },
                {
                    id: 5,
                    folder: 'inbox',
                    from: 'Taxpayer Inquiries <tickets@irs.internal>',
                    subject: 'Ticket #4491: Citizen claims golden retriever as dependent',
                    date: 'Yesterday 17:02',
                    size: '4 KB',
                    read: true,
                    body: `Case Reference: TX-98-994821

Taxpayer asserts:
"My dog Barnaby guards the house and consumes $850 in kibble annually, qualifying him as a vital security deduction on Schedule-A Line 4."

Status: Awaiting Examiner Arthur Pendelton's official rejection stamp.`
                },
                {
                    id: 6,
                    folder: 'inbox',
                    from: 'Treasury Mainframe Admin <root@mainframe>',
                    subject: 'CRITICAL: Scheduled Mainframe Power Cut at 17:00:00',
                    date: 'Yesterday 08:00',
                    size: '2 KB',
                    read: true,
                    body: `AUTOMATED BROADCAST:

The central database server will shut down for routine vacuum tube maintenance at 17:00:00 (5:00 PM) today.

Any Form 1040 returns not transmitted electronically prior to this timestamp will be purged from volatile memory buffers.`
                }
            ];
        }

        init() {
            this.renderFolderCounts();
            this.renderEmailList();
            this.renderEmailPreview();
            this.setupEvents();
        }

        renderFolderCounts() {
            const unread = this.emails.filter(e => e.folder === 'inbox' && !e.read).length;
            const inboxCountEl = document.getElementById('mail-inbox-count');
            if (inboxCountEl) {
                inboxCountEl.innerText = unread > 0 ? `Inbox (${unread})` : 'Inbox';
                inboxCountEl.style.fontWeight = unread > 0 ? 'bold' : 'normal';
            }
        }

        renderEmailList() {
            const listContainer = document.getElementById('mail-list-tbody');
            if (!listContainer) return;

            listContainer.innerHTML = '';
            const filtered = this.emails.filter(e => e.folder === this.currentFolder);

            filtered.forEach(email => {
                const tr = document.createElement('tr');
                tr.className = `mail-row ${email.id === this.activeEmailId ? 'selected' : ''} ${!email.read ? 'unread' : ''}`;
                tr.dataset.id = email.id;

                tr.innerHTML = `
                    <td style="width: 24px; text-align: center;">
                        <img src="${email.read ? 'assets/icon_notepad.png' : 'assets/icon_notepad.png'}" width="14" height="14" style="image-rendering: pixelated;">
                    </td>
                    <td style="width: 170px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${email.from}
                    </td>
                    <td style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${email.subject}
                    </td>
                    <td style="width: 85px; text-align: right; color: #555;">
                        ${email.date}
                    </td>
                    <td style="width: 45px; text-align: right; color: #777;">
                        ${email.size}
                    </td>
                `;

                tr.addEventListener('click', () => {
                    this.selectEmail(email.id);
                });

                listContainer.appendChild(tr);
            });
        }

        selectEmail(id) {
            this.activeEmailId = id;
            const email = this.emails.find(e => e.id === id);
            if (email) {
                email.read = true;
                this.renderFolderCounts();
                this.renderEmailList();
                this.renderEmailPreview();

                // Workday Quest: Read Director Vance's warning email
                if (email.id === 1 && window.QuestEngine) {
                    window.QuestEngine.complete('memo');
                }
            }
            if (window.AudioMgr) window.AudioMgr.playSfx('select');
        }

        renderEmailPreview() {
            const email = this.emails.find(e => e.id === this.activeEmailId);
            const fromEl = document.getElementById('mail-preview-from');
            const subjEl = document.getElementById('mail-preview-subject');
            const dateEl = document.getElementById('mail-preview-date');
            const bodyEl = document.getElementById('mail-preview-body');

            if (!email) {
                if (fromEl) fromEl.innerText = '';
                if (subjEl) subjEl.innerText = 'No email selected';
                if (dateEl) dateEl.innerText = '';
                if (bodyEl) bodyEl.innerText = '';
                return;
            }

            if (fromEl) fromEl.innerText = email.from;
            if (subjEl) subjEl.innerText = email.subject;
            if (dateEl) dateEl.innerText = email.date;
            if (bodyEl) bodyEl.innerText = email.body;
        }

        setupEvents() {
            const replyBtn = document.getElementById('btn-mail-reply');
            if (replyBtn) {
                replyBtn.addEventListener('click', () => {
                    const email = this.emails.find(e => e.id === this.activeEmailId);
                    if (!email) return;

                    if (window.AudioMgr) window.AudioMgr.playSfx('stapler');
                    alert(
                        `AUTOMATED BUREAUCRATIC DISPATCH GENERATED:\n\n` +
                        `To: ${email.from}\n` +
                        `Subject: RE: ${email.subject}\n\n` +
                        `"Under Federal Administrative Procedure Code § 44-B, your communication has been received, stamped in triplicate, and archived without substantive action.\n\n` +
                        `Arthur P. Pendelton\nSenior Examiner, Desk 14-B"`
                    );
                });
            }

            const sendReceiveBtn = document.getElementById('btn-mail-sendrec');
            if (sendReceiveBtn) {
                sendReceiveBtn.addEventListener('click', () => {
                    if (window.AudioMgr) window.AudioMgr.playSfx('ding');
                    alert("Revenue Mail Express: Connecting to State SMTP Mainframe via 33.6k modem...\nNo new incoming taxpayer disputes found.");
                });
            }
        }
    }

    window.MailApp = new RetroMailApp();

    document.addEventListener('DOMContentLoaded', () => {
        window.MailApp.init();
    });
})();
