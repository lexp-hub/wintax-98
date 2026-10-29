// vfs.js - Authentic Windows 98 Virtual File System (VFS) with localStorage Persistence
// Supports full CRUD, folder hierarchies, recycling/restoration, and story lore files.

(function() {
    'use strict';

    const STORAGE_KEY = 'wintax98_vfs_v1';

    class VirtualFileSystem {
        constructor() {
            this.root = null;
            this.init();
        }

        init() {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    this.root = JSON.parse(saved);
                    // Ensure core directories exist
                    if (!this.getNode('/C:/RECYCLE_BIN')) {
                        this.mkdir('/C:/RECYCLE_BIN');
                    }
                    return;
                } catch (e) {
                    console.error("Corrupted VFS data, resetting to default factory seed", e);
                }
            }
            this.reset();
        }

        save() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.root));
            } catch (e) {
                console.error("VFS save error (quota exceeded?)", e);
            }
        }

        reset() {
            this.root = this.getFactorySeed();
            this.save();
        }

        getFactorySeed() {
            const now = new Date().toISOString();
            return {
                id: 'root',
                name: '/',
                type: 'folder',
                mtime: now,
                children: {
                    'C:': {
                        id: 'drive_c',
                        name: 'C:',
                        type: 'folder',
                        mtime: now,
                        children: {
                            'TAX_DOCUMENTS': {
                                id: 'tax_docs',
                                name: 'TAX_DOCUMENTS',
                                type: 'folder',
                                mtime: now,
                                children: {
                                    'TaxReturn_2024.ade': {
                                        id: 'f_taxreturn',
                                        name: 'TaxReturn_2024.ade',
                                        type: 'file',
                                        app: 'entratel',
                                        size: '42.8 KB',
                                        mtime: '1998-10-29 09:14',
                                        content: "[FEDERAL REVENUE SERVICE - FORM 1040 SCHEDULE-A]\n\nTaxpayer Name: Arthur P. Pendelton\nSSN / ID: 042-99-8420\nCubicle: 14-B (Examiner Grade 3)\nSupervisor: Director G. Vance\n\nGross Income Assessed: $ 34,200.00\nClaimed Work Expenses: $ 4,820.00\nStatus: PENDING PHYSICAL IN-PERSON AUDIT & SUPERVISOR CLEARANCE\n\nWarning: Electronic transmission strictly locked until physical presence verified."
                                    },
                                    'Secret_Audit_Codes.txt': {
                                        id: 'f_audit_codes',
                                        name: 'Secret_Audit_Codes.txt',
                                        type: 'file',
                                        app: 'notepad',
                                        size: '1.2 KB',
                                        mtime: '1998-10-28 16:45',
                                        content: "SECRET AUDIT NOTES (Passed down from retired examiner Joe):\n\n1. When the system requires physical in-person audit, check the verification box and cite Statute P.L. 104-168.\n2. In the basement archives, the tax demon responds poorly to high-speed heavy-duty staples.\n3. Director Vance's surveillance patrol car on the highway has bad brakes on sharp turns.\n4. Keep warm coffee in the CD tray at all times to soothe the motherboard."
                                    },
                                    'Deduction_Receipts_1998.txt': {
                                        id: 'f_receipts',
                                        name: 'Deduction_Receipts_1998.txt',
                                        type: 'file',
                                        app: 'notepad',
                                        size: '890 B',
                                        mtime: '1998-10-29 11:20',
                                        content: "ITEMIZED EXPENSE SCHEDULE (Arthur Pendelton, Desk 14-B):\n\n- 1x Ergonomic Lumbar Cushion (Damaged by office cat): $ 24.50\n- 12x Packs of Extra-Strength Aspirin: $ 48.00\n- 1x Swingline Heavy-Duty Red Stapler: $ 18.20\n- 350x Vending machine espresso shots: $ 175.00\n- 1x Disputed parking ticket outside IRS district annex: $ 65.00\n\nTOTAL TO BE DEDUCTED: $ 330.70"
                                    }
                                }
                            },
                            'MEMOS': {
                                id: 'memos',
                                name: 'MEMOS',
                                type: 'folder',
                                mtime: now,
                                children: {
                                    'DIRECTOR_VANCE_WARNING.txt': {
                                        id: 'f_vance_warning',
                                        name: 'DIRECTOR_VANCE_WARNING.txt',
                                        type: 'file',
                                        app: 'notepad',
                                        size: '1.8 KB',
                                        mtime: '1998-10-29 08:30',
                                        content: "FEDERAL DEPARTMENT OF REVENUE & BUREAUCRACY\nOFFICIAL MEMORANDUM - STRICTLY CONFIDENTIAL\n\nFROM: Director G. Vance (Chief Comptroller)\nTO: Arthur P. Pendelton (Desk 14-B)\n\nArthur,\nYour filing quota for the quarter is unacceptably behind schedule. The Federal mainframe will enforce a hard lockdown at 5:00 PM SHARP.\n\nIf Form 1040 is not audited, certified with an approved stamp, and electronically dispatched before the clock bells strike 5:00, your annual holiday leave will be summarily revoked, and you will be assigned to manual microfiche scrubbing for all of November.\n\nAlso: cease inserting hot beverages into the ATAPI 24X CD-ROM drive immediately.\n\n- Vance"
                                    },
                                    'IT_SECURITY_ALERT.txt': {
                                        id: 'f_it_alert',
                                        name: 'IT_SECURITY_ALERT.txt',
                                        type: 'file',
                                        app: 'notepad',
                                        size: '1.1 KB',
                                        mtime: '1998-10-29 10:05',
                                        content: "INTERNAL IT BULLETIN #42\n\nSubject: Anomalous Operating System Glitches in WinTax 98 SE\n\nAll employees are advised that the basement document archives have experienced spectral manifest anomalies due to unfiled 1994 tax returns. If you encounter roaming tax folders, please neutralize them with the standard office stapler.\n\nDo not click on suspicious Java cookie notifications unless you are prepared to perform an evasive vehicular getaway."
                                    }
                                }
                            },
                            'DIARY': {
                                id: 'diary',
                                name: 'DIARY',
                                type: 'folder',
                                mtime: now,
                                children: {
                                    'arthurs_journal_1998.txt': {
                                        id: 'f_arthurs_journal',
                                        name: 'arthurs_journal_1998.txt',
                                        type: 'file',
                                        app: 'notepad',
                                        size: '2.4 KB',
                                        mtime: '1998-10-29 15:45',
                                        content: "October 29, 1998 - 4:15 PM (Desk 14-B)\n\nTwenty-two years in this cubicle. The fluorescent overhead bulbs buzz in B-flat. Every time I think the desk is clear, another green-bar printout arrives in the in-tray.\n\nDirector Vance gave me that look again when he passed by with his leather clipboard. My monitor is flickering at 60 Hz and the mouse ball keeps gathering lint from my tweed jacket. Just 45 minutes until 5:00 PM. If I can finish this return, stamp it, and hit Send, I can walk out that revolving door and catch the 5:15 commuter train.\n\nHang in there, Arthur. Just stay calm and drink your coffee."
                                    },
                                    'breakroom_rules.txt': {
                                        id: 'f_breakroom',
                                        name: 'breakroom_rules.txt',
                                        type: 'file',
                                        app: 'notepad',
                                        size: '620 B',
                                        mtime: '1998-10-20 14:10',
                                        content: "CUBICLE 14 RULES OF SURVIVAL:\n\n1. Never microwave fish in the 3rd floor pantry.\n2. When Vance asks 'Got a minute?', pretend to be rebooting.\n3. The CD-ROM cup holder tray opens with Coffee.exe.\n4. Always double-check line 22 on Form 1040."
                                    }
                                }
                            },
                            'PROGRAMS': {
                                id: 'programs',
                                name: 'PROGRAMS',
                                type: 'folder',
                                mtime: now,
                                children: {
                                    'DOOM_TAX.EXE': { id: 'p_doom', name: 'DOOM_TAX.EXE', type: 'file', app: 'doom', size: '640 KB', mtime: '1998-10-25 12:00' },
                                    'PANDA_RACE.EXE': { id: 'p_racer', name: 'PANDA_RACE.EXE', type: 'file', app: 'racer', size: '512 KB', mtime: '1998-10-25 12:00' },
                                    'AUDIT_RPG.EXE': { id: 'p_rpg', name: 'AUDIT_RPG.EXE', type: 'file', app: 'rpg', size: '384 KB', mtime: '1998-10-25 12:00' },
                                    'PBRUSH.EXE': { id: 'p_paint', name: 'PBRUSH.EXE', type: 'file', app: 'paint', size: '128 KB', mtime: '1998-10-25 12:00' },
                                    'CALC.EXE': { id: 'p_calc', name: 'CALC.EXE', type: 'file', app: 'calc', size: '64 KB', mtime: '1998-10-25 12:00' },
                                    'NOTEPAD.EXE': { id: 'p_notepad', name: 'NOTEPAD.EXE', type: 'file', app: 'notepad', size: '48 KB', mtime: '1998-10-25 12:00' }
                                }
                            },
                            'RECYCLE_BIN': {
                                id: 'recycle_bin',
                                name: 'RECYCLE_BIN',
                                type: 'folder',
                                mtime: now,
                                children: {
                                    'Form_730_1994.bak': {
                                        id: 'del_730',
                                        name: 'Form_730_1994.bak',
                                        type: 'file',
                                        app: 'notepad',
                                        size: '42 KB',
                                        originalPath: '/C:/TAX_DOCUMENTS/Form_730_1994.bak',
                                        mtime: '1994-04-15 17:01',
                                        content: "Outdated 1994 Tax Ledger. Deleted due to statutory obsolescence."
                                    },
                                    'Dismissed_Fine_Notice.tmp': {
                                        id: 'del_fine',
                                        name: 'Dismissed_Fine_Notice.tmp',
                                        type: 'file',
                                        app: 'notepad',
                                        size: '18 KB',
                                        originalPath: '/C:/MEMOS/Dismissed_Fine_Notice.tmp',
                                        mtime: '1997-12-31 23:59',
                                        content: "Parking fine notice at State Revenue Headquarters. Disputed and discarded."
                                    }
                                }
                            }
                        }
                    },
                    'A:': {
                        id: 'drive_a',
                        name: 'A:',
                        type: 'folder',
                        mtime: now,
                        children: {
                            'escape_plan.txt': {
                                id: 'f_escape',
                                name: 'escape_plan.txt',
                                type: 'file',
                                app: 'notepad',
                                size: '740 B',
                                mtime: '1998-10-29 14:00',
                                content: "RESCUE DISKETTE (3.5 inch, 1.44 MB):\n\nIf the clock reaches 4:59 PM and Vance is standing at the cubicle entrance:\n1. Hit Panic Test button or press Ctrl+Alt+Del.\n2. Complete Panda Race to clear out the road.\n3. Make sure the Approved Stamp has been applied.\n\nFreedom awaits at 5:00 PM!"
                            }
                        }
                    }
                }
            };
        }

        normalizePath(path) {
            if (!path) return '/C:';
            let p = path.trim().replace(/\\/g, '/');
            if (!p.startsWith('/')) p = '/' + p;
            p = p.replace(/\/+/g, '/');
            if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
            return p;
        }

        getNode(path) {
            const cleanPath = this.normalizePath(path);
            if (cleanPath === '/' || cleanPath === '') return this.root;

            const parts = cleanPath.split('/').filter(Boolean);
            let curr = this.root;

            for (const part of parts) {
                if (!curr || curr.type !== 'folder' || !curr.children) return null;
                curr = curr.children[part];
                if (!curr) return null;
            }
            return curr;
        }

        getParentNode(path) {
            const cleanPath = this.normalizePath(path);
            const idx = cleanPath.lastIndexOf('/');
            if (idx <= 0) return this.root;
            const parentPath = cleanPath.substring(0, idx);
            return this.getNode(parentPath);
        }

        list(path) {
            const node = this.getNode(path);
            if (!node || node.type !== 'folder') return [];
            return Object.values(node.children || {});
        }

        readFile(path) {
            const node = this.getNode(path);
            if (!node || node.type !== 'file') return null;
            return node.content || '';
        }

        writeFile(path, content, app = 'notepad') {
            const cleanPath = this.normalizePath(path);
            const parts = cleanPath.split('/').filter(Boolean);
            if (parts.length === 0) return false;

            const fileName = parts.pop();
            const parentPath = '/' + parts.join('/');
            const parent = this.getNode(parentPath);

            if (!parent || parent.type !== 'folder') {
                this.mkdir(parentPath);
            }
            const targetParent = this.getNode(parentPath);
            if (!targetParent || !targetParent.children) return false;

            const existing = targetParent.children[fileName];
            const sizeBytes = new Blob([content]).size;
            const sizeStr = sizeBytes > 1024 ? `${(sizeBytes / 1024).toFixed(1)} KB` : `${sizeBytes} B`;
            const now = new Date();
            const pad = (n) => String(n).padStart(2, '0');
            const mtime = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

            if (existing) {
                existing.content = content;
                existing.size = sizeStr;
                existing.mtime = mtime;
            } else {
                targetParent.children[fileName] = {
                    id: 'f_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                    name: fileName,
                    type: 'file',
                    app: app,
                    size: sizeStr,
                    mtime: mtime,
                    content: content
                };
            }
            this.save();
            return true;
        }

        mkdir(path) {
            const cleanPath = this.normalizePath(path);
            const parts = cleanPath.split('/').filter(Boolean);
            let curr = this.root;

            for (const part of parts) {
                if (!curr.children) curr.children = {};
                if (!curr.children[part]) {
                    curr.children[part] = {
                        id: 'dir_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                        name: part,
                        type: 'folder',
                        mtime: new Date().toISOString(),
                        children: {}
                    };
                }
                curr = curr.children[part];
            }
            this.save();
            return true;
        }

        deleteItem(path) {
            const cleanPath = this.normalizePath(path);
            const parent = this.getParentNode(cleanPath);
            const fileName = cleanPath.split('/').filter(Boolean).pop();

            if (!parent || !parent.children || !parent.children[fileName]) return false;

            const item = parent.children[fileName];
            delete parent.children[fileName];

            // If already in Recycle Bin, delete permanently
            if (cleanPath.startsWith('/C:/RECYCLE_BIN')) {
                this.save();
                return true;
            }

            // Move to Recycle Bin
            const recycleBin = this.getNode('/C:/RECYCLE_BIN');
            if (recycleBin && recycleBin.children) {
                item.originalPath = cleanPath;
                recycleBin.children[fileName] = item;
            }

            this.save();
            return true;
        }

        restoreItem(fileName) {
            const recycleBin = this.getNode('/C:/RECYCLE_BIN');
            if (!recycleBin || !recycleBin.children || !recycleBin.children[fileName]) return false;

            const item = recycleBin.children[fileName];
            delete recycleBin.children[fileName];

            const destPath = item.originalPath || `/C:/TAX_DOCUMENTS/${fileName}`;
            const destParts = destPath.split('/').filter(Boolean);
            destParts.pop();
            const parentPath = '/' + destParts.join('/');

            let destParent = this.getNode(parentPath);
            if (!destParent) {
                this.mkdir(parentPath);
                destParent = this.getNode(parentPath);
            }

            if (destParent && destParent.children) {
                delete item.originalPath;
                destParent.children[fileName] = item;
            }

            this.save();
            return true;
        }

        emptyRecycleBin() {
            const recycleBin = this.getNode('/C:/RECYCLE_BIN');
            if (recycleBin) {
                recycleBin.children = {};
                this.save();
                return true;
            }
            return false;
        }

        rename(path, newName) {
            const cleanPath = this.normalizePath(path);
            const parent = this.getParentNode(cleanPath);
            const oldName = cleanPath.split('/').filter(Boolean).pop();

            if (!parent || !parent.children || !parent.children[oldName]) return false;
            if (parent.children[newName]) return false; // Name conflict

            const item = parent.children[oldName];
            delete parent.children[oldName];
            item.name = newName;
            parent.children[newName] = item;

            this.save();
            return true;
        }
    }

    window.VFS = new VirtualFileSystem();
})();
