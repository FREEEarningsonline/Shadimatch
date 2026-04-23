// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDR2OugzoVNnKN6OUKsPxC9ajldlhanteE",
    authDomain: "tournament-af6dd.firebaseapp.com",
    projectId: "tournament-af6dd",
    storageBucket: "tournament-af6dd.firebasestorage.app",
    messagingSenderId: "726964405659",
    appId: "1:726964405659:web:d03f72c2d6f8721bc98d3e"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

let currentUser = null, myProfileKey = null, activeChatId = null;
let currentLimit = 10;

const toBase64 = f => new Promise(res => { const r = new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(f); });

function showSection(id, el) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if(el) { document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active')); el.classList.add('active'); }
    window.scrollTo(0,0);
}

// Authentication
function handleAuth(type) {
    const e = document.getElementById('email').value, p = document.getElementById('pass').value;
    if(!e || !p) return alert("Email/Pass required");
    if(type === 'login') auth.signInWithEmailAndPassword(e, p).catch(err => alert(err.message));
    else auth.createUserWithEmailAndPassword(e, p).catch(err => alert(err.message));
}

function logoutUser() { auth.signOut().then(() => location.reload()); }

auth.onAuthStateChanged(user => {
    currentUser = user;
    if(user) {
        document.getElementById('authView').classList.add('hidden');
        document.getElementById('profileEditView').classList.remove('hidden');
        loadMyProfile();
    }
    loadExplore(); loadRequests(); loadMatches();
});

// Profile Management
async function saveProfile() {
    if(!currentUser) return;
    const file = document.getElementById('pFile').files[0];
    let img = document.getElementById('pImageUrl').value || window.currentImg || "";
    if(file) img = await toBase64(file);

    const data = {
        uid: currentUser.uid, name: document.getElementById('pName').value, age: document.getElementById('pAge').value,
        gender: document.getElementById('pGender').value, marital: document.getElementById('pMarital').value, city: document.getElementById('pCity').value,
        fatherName: document.getElementById('fName').value, fatherOcc: document.getElementById('fOcc').value, motherName: document.getElementById('mName').value,
        siblings: document.getElementById('siblings').value, familyType: document.getElementById('fType').value,
        eduLevel: document.getElementById('pEdu').value, fieldStudy: document.getElementById('pStudy').value, profession: document.getElementById('pProf').value,
        empStatus: document.getElementById('pEmp').value, monthlyIncome: document.getElementById('pIncome').value,
        height: document.getElementById('pHeight').value, weight: document.getElementById('pWeight').value, religion: document.getElementById('pReligion').value,
        sect: document.getElementById('pSect').value, caste: document.getElementById('pCaste').value,
        hobbies: document.getElementById('pHobbies').value, skills: document.getElementById('pSkills').value, lang: document.getElementById('pLang').value,
        smoke: document.getElementById('pSmoke').value, area: document.getElementById('pArea').value, relocate: document.getElementById('pRelocate').value,
        prefAge: document.getElementById('prefAge').value, prefCity: document.getElementById('prefCity').value, prefEdu: document.getElementById('prefEdu').value,
        image: img, isVerified: window.isVerifStatus || false
    };

    if(myProfileKey) db.ref('profiles/' + myProfileKey).set(data);
    else db.ref('profiles').push(data);
    alert("Profile Saved!");
}

function loadMyProfile() {
    db.ref('profiles').orderByChild('uid').equalTo(currentUser.uid).on('value', snap => {
        snap.forEach(child => {
            const p = child.val(); myProfileKey = child.key;
            document.getElementById('pName').value = p.name || ""; document.getElementById('pAge').value = p.age || "";
            document.getElementById('pGender').value = p.gender || ""; document.getElementById('pMarital').value = p.marital || "";
            document.getElementById('pCity').value = p.city || ""; document.getElementById('fName').value = p.fatherName || "";
            document.getElementById('fOcc').value = p.fatherOcc || ""; document.getElementById('mName').value = p.motherName || "";
            document.getElementById('siblings').value = p.siblings || ""; document.getElementById('fType').value = p.familyType || "";
            document.getElementById('pEdu').value = p.eduLevel || ""; document.getElementById('pStudy').value = p.fieldStudy || "";
            document.getElementById('pProf').value = p.profession || ""; document.getElementById('pEmp').value = p.empStatus || "";
            document.getElementById('pIncome').value = p.monthlyIncome || ""; document.getElementById('pHeight').value = p.height || "";
            document.getElementById('pWeight').value = p.weight || ""; document.getElementById('pReligion').value = p.religion || "";
            document.getElementById('pSect').value = p.sect || ""; document.getElementById('pCaste').value = p.caste || "";
            document.getElementById('pHobbies').value = p.hobbies || ""; document.getElementById('pSkills').value = p.skills || "";
            document.getElementById('pLang').value = p.lang || ""; document.getElementById('pSmoke').value = p.smoke || "";
            document.getElementById('pArea').value = p.area || ""; document.getElementById('pRelocate').value = p.relocate || "";
            document.getElementById('prefAge').value = p.prefAge || ""; document.getElementById('prefCity').value = p.prefCity || "";
            document.getElementById('prefEdu').value = p.prefEdu || "";
            window.currentImg = p.image; window.isVerifStatus = p.isVerified;
            if(p.isVerified) document.getElementById('headerVerify').style.display = 'inline-block';
        });
    });
}

// Explore with Pagination
function loadExplore() {
    db.ref('profiles').limitToLast(currentLimit).on('value', snap => {
        const list = document.getElementById('exploreList'); list.innerHTML = "";
        const lBtn = document.getElementById('loadMoreContainer');
        if(!snap.exists()) return;
        
        let arr = []; snap.forEach(c => { if(!currentUser || c.val().uid !== currentUser.uid) arr.push(c.val()); });
        arr.reverse().forEach(p => {
            const row = (l, v) => v ? `<div class="row"><b>${l}:</b> <span>${v}</span></div>` : '';
            list.innerHTML += `
                <div class="card">${p.isVerified ? '<div class="v-badge">VERIFIED</div>' : ''}
                <img src="${p.image || 'https://via.placeholder.com/600'}">
                <div class="card-body">
                    <div class="c-name">${p.name} ${p.isVerified ? '<i class="fas fa-check-circle" style="color:#0095f6"></i>' : ''}</div>
                    <div class="card-section"><h4>Basic</h4>${row('Age',p.age)}${row('Gender',p.gender)}${row('City',p.city)}</div>
                    ${(p.fatherName || p.familyType)?`<div class="card-section"><h4>Family</h4>${row('Father',p.fatherName)}${row('Type',p.familyType)}</div>`:''}
                    ${(p.eduLevel || p.profession)?`<div class="card-section"><h4>Career</h4>${row('Edu',p.eduLevel)}${row('Job',p.profession)}</div>`:''}
                    <button class="btn btn-main" onclick="sendReq('${p.uid}', '${p.name}')">Send Interest</button>
                </div></div>`;
        });
        lBtn.className = (snap.numChildren() >= currentLimit) ? "" : "hidden";
    });
}

function increaseLimit() { currentLimit += 10; loadExplore(); }

// Requests & Chats
function sendReq(toUid, name) {
    if(!currentUser) return alert("Login first");
    db.ref('requests/' + toUid).push({ fromUid: currentUser.uid, fromEmail: currentUser.email, status: 'pending' });
    alert("Request sent!");
}

function loadRequests() {
    if(!currentUser) return;
    db.ref('requests/' + currentUser.uid).on('value', snap => {
        const pl = document.getElementById('pendingList'), al = document.getElementById('approvedList');
        pl.innerHTML = ""; al.innerHTML = "";
        snap.forEach(c => {
            const r = c.val(), k = c.key;
            if(r.status === 'pending') pl.innerHTML += `<div class="form-group"><b>From: ${r.fromEmail}</b><button class="btn btn-main" onclick="db.ref('requests/${currentUser.uid}/${k}').update({status:'approved'})">Accept</button></div>`;
            else if(r.status === 'approved') al.innerHTML += `<div class="form-group"><b>Match: ${r.fromEmail}</b><button class="btn btn-main" onclick="openChat('${r.fromUid}','${r.fromEmail}')">Chat</button></div>`;
        });
    });
}

function openChat(otherUid, name) {
    document.getElementById('chatUserName').innerText = name;
    document.getElementById('chatOverlay').style.display = 'flex';
    activeChatId = [currentUser.uid, otherUid].sort().join('_');
    db.ref('chats/' + activeChatId).on('value', snap => {
        const box = document.getElementById('chatMessages'); box.innerHTML = "";
        snap.forEach(c => { box.innerHTML += `<div class="msg ${c.val().sender===currentUser.uid?'sent':'received'}">${c.val().text}</div>`; });
        box.scrollTop = box.scrollHeight;
    });
}

function sendMessage() {
    const i = document.getElementById('chatInput'); if(!i.value.trim()) return;
    db.ref('chats/' + activeChatId).push({ sender: currentUser.uid, text: i.value }); i.value = "";
}

function closeChat() { document.getElementById('chatOverlay').style.display = 'none'; db.ref('chats/' + activeChatId).off(); }

async function applyVerification() {
    const f = document.getElementById('cnicFront').files[0], b = document.getElementById('cnicBack').files[0], s = document.getElementById('selfieImg').files[0];
    if(!f || !b || !s) return alert("Select 3 images!");
    const data = { uid: currentUser.uid, front: await toBase64(f), back: await toBase64(b), selfie: await toBase64(s) };
    db.ref('verification_requests/' + currentUser.uid).set(data).then(() => alert("Docs Sent!"));
}

function loadMatches() {
    db.ref('requests').on('value', snap => {
        const ml = document.getElementById('matchList'); ml.innerHTML = "";
        snap.forEach(u => u.forEach(r => { if(r.val().status==='matched') ml.innerHTML += `<div class="form-group">🎉 Match: ${r.val().fromEmail}</div>`; }));
    });
}

function deleteProfile() { if(confirm("Confirm Delete?")) { if(myProfileKey) db.ref('profiles/' + myProfileKey).remove().then(() => location.reload()); } }
