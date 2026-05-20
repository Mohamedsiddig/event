// ============================================
// نظام التسجيل مع جوجل شيت + LocalStorage
// الأسبوع التكنولوجي - كلية المجد
// ============================================

// الرابط الجديد لـ Google Apps Script
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyNrORJLhBvmIb0fOB5ROv5_-d7grmyeyBRiW5_Fn7s0oK6IX_Jqc73OrBT3IkHIyBc/exec";

const STORAGE_REGISTRATIONS = "tech_week_registrations";
const STORAGE_TEAM_MEMBERS = "tech_week_team";
const STORAGE_ORGANIZERS = "tech_week_organizers";

// بيانات فريق العمل (محدثة)
const defaultTeamMembers = [
    { id: 1, name: "تامر عماد", role: "", section: "networking", image: "network", bio: "خبير في أمن الشبكات وبروتوكولات الاتصال" },
    { id: 2, name: "المكتفي بالله قرشي", role: "", section: "networking", image: "network", bio: "متخصصص في تكوين وإدارة الشبكات المحلية" },
    { id: 3, name: "عبدالصادق الأمين ", role: "", section: "networking", image: "network", bio: "خبير في مجال البنية التحتية للشبكات" },
    { id: 4, name: "خالد عز الدين ", role: "", section: "software", image: "code", bio: "مطور تطبيقات ويب، مهتم بتقنيات Full Stack" },
    { id: 5, name: "أحمد ياسر أحمد", role: "", section: "software", image: "code", bio: "خبير في تطوير التطبيقات بلغة Python وJavaScript" },
    { id: 6, name: "عمر محمد احمد", role: "", section: "software", image: "code", bio: "مختصص في تطوير واجهات المستخدم التفاعلية" },
    { id: 7, name: "عبدالله أسامة عبدالله", role: "", section: "hardware", image: "microchip", bio: "مهندس عتاد، خبير في معالجات الحاسوب" },
    { id: 8, name: " الفاتح علي   ", role: "", section: "hardware", image: "microchip", bio: "متخصصص في تجميع وصيانة الحواسيب" },
     

];

// بيانات اللجنة المنظمة (محدثة)
const defaultOrganizers = [
    { id: 1, name: "أ. محمد سر الختم", position: "رئيس اللجنة المنظمة", image: "user-tie", bio: "منسق تقانة المعلومات" },
    { id: 2, name: "أ. أحمد ميرف", position: "نائب رئيس اللجنة", image: "user-graduate", bio: "نائب منسق تقانة المعلومات" },
    { id: 3, name: "مدثر الريح ", position: "عضو لجنة التنظيم", image: "user-tie", bio: "منسق الأنشطة الثقافية" },
    { id: 4, name: "زينب نصر الدين", position: "عضو لجنة التنظيم", image: "user-graduate", bio: "مسؤولة عن التظيم " },
    { id: 5, name: "الفاتح علي ", position: "عضو لجنة التنظيم", image: "user-tie", bio: "الإشراف على الإعلام" }
];

// 🔐 كلمة المرور السرية للمسؤول
const ADMIN_PASSWORD = "admin2026";

// تهيئة قاعدة البيانات المحلية (مع فرض التحديث)
function initDatabase() {
    // تحديث فريق العمل واللجنة المنظمة بالقيم الجديدة (فرض التحديث)
    localStorage.setItem(STORAGE_TEAM_MEMBERS, JSON.stringify(defaultTeamMembers));
    localStorage.setItem(STORAGE_ORGANIZERS, JSON.stringify(defaultOrganizers));
    
    if (!localStorage.getItem(STORAGE_REGISTRATIONS)) {
        localStorage.setItem(STORAGE_REGISTRATIONS, JSON.stringify([]));
    }
}

// الحصول على البيانات المحلية
function getTeamMembers() {
    return JSON.parse(localStorage.getItem(STORAGE_TEAM_MEMBERS)) || [];
}

function getOrganizers() {
    return JSON.parse(localStorage.getItem(STORAGE_ORGANIZERS)) || [];
}

function getLocalRegistrations() {
    return JSON.parse(localStorage.getItem(STORAGE_REGISTRATIONS)) || [];
}

// حفظ التسجيل محلياً
function saveLocalRegistration(data) {
    const registrations = getLocalRegistrations();
    registrations.push(data);
    localStorage.setItem(STORAGE_REGISTRATIONS, JSON.stringify(registrations));
}

// إرسال التسجيل إلى جوجل شيت
async function sendToGoogleSheets(registrationData) {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registrationData)
        });
        return { success: true };
    } catch (error) {
        console.error("خطأ في الإرسال لجوجل شيت:", error);
        return { success: false, error: error.message };
    }
}

// دالة التسجيل الرئيسية
async function addRegistration(data) {
    const workshopNames = {
        networking: "ورشة الشبكات",
        software: "ورشة الـ Software",
        hardware: "ورشة الـ Hardware",
        cultural: "الحفل الثقافي"
    };
    
    const registrationData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        major: data.major || "غير محدد",
        workshop: workshopNames[data.workshop] || data.workshop,
        timestamp: new Date().toLocaleString('ar-SA')
    };
    
    saveLocalRegistration(registrationData);
    const result = await sendToGoogleSheets(registrationData);
    
    return {
        success: true,
        googleSheetsStatus: result.success ? "تم الحفظ في جوجل شيت" : "تم الحفظ محلياً فقط",
        data: registrationData
    };
}

// عرض لوحة تحكم المسؤول
function showAdminLogin() {
    const password = prompt("🔐 أدخل كلمة مرور المسؤول للوصول إلى لوحة التحكم:");
    
    if (password === ADMIN_PASSWORD) {
        showAdminPanel();
    } else if (password !== null) {
        alert("❌ كلمة المرور غير صحيحة! لا يمكنك الوصول إلى لوحة التحكم.");
    }
}

// عرض لوحة تحكم المسؤول
function showAdminPanel() {
    const registrations = getLocalRegistrations();
    
    if (registrations.length === 0) {
        alert("📭 لا يوجد مسجلين حالياً");
        return;
    }
    
    let message = "📋 قائمة المسجلين:\n\n";
    message += "═".repeat(50) + "\n";
    
    registrations.forEach((reg, index) => {
        message += `${index + 1}. ${reg.name}\n`;
        message += `   📧 ${reg.email}\n`;
        message += `   📞 ${reg.phone}\n`;
        message += `   🎓 ${reg.major}\n`;
        message += `   🏷️ ${reg.workshop}\n`;
        message += `   🕐 ${reg.timestamp}\n`;
        message += "─".repeat(40) + "\n";
    });
    
    const exportChoice = confirm(message + "\n\nهل تريد تصدير البيانات كملف Excel؟\n(اضغط OK للتصدير، Cancel للإلغاء)");
    
    if (exportChoice) {
        exportRegistrationsToCSV();
    }
}

// تصدير المسجلين إلى CSV
function exportRegistrationsToCSV() {
    const registrations = getLocalRegistrations();
    
    if (registrations.length === 0) {
        alert("📭 لا يوجد مسجلين للتصدير");
        return;
    }
    
    const headers = ["الاسم", "البريد الإلكتروني", "رقم الهاتف", "التخصص", "الورشة", "تاريخ التسجيل"];
    const rows = registrations.map(reg => [
        reg.name,
        reg.email,
        reg.phone,
        reg.major,
        reg.workshop,
        reg.timestamp
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `tech_week_registrations_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert("✅ تم تصدير بيانات المسجلين كملف CSV");
}

// عرض فريق العمل
function renderTeamMembers(filter = "all") {
    const teamGrid = document.getElementById("teamGrid");
    if (!teamGrid) return;
    
    let members = getTeamMembers();
    if (filter !== "all") {
        members = members.filter(m => m.section === filter);
    }
    
    const sectionNames = {
        networking: "شبكات",
        software: "Software",
        hardware: "Hardware",
        cultural: "ثقافي"
    };
    
    teamGrid.innerHTML = members.map(member => `
        <div class="member-card">
            <div class="member-img">
                <i class="fas fa-${member.image}"></i>
            </div>
            <h3>${member.name}</h3>
            <div class="member-role">${member.role}</div>
            <div class="member-section">قسم ${sectionNames[member.section]}</div>
            <p style="padding: 0 1rem 1rem; color: #64748b; font-size: 0.85rem;">${member.bio}</p>
        </div>
    `).join("");
}

// عرض اللجنة المنظمة
function renderOrganizers() {
    const organizersGrid = document.getElementById("organizersGrid");
    if (!organizersGrid) return;
    
    const organizers = getOrganizers();
    organizersGrid.innerHTML = organizers.map(org => `
        <div class="org-card">
            <i class="fas fa-${org.image}"></i>
            <h3>${org.name}</h3>
            <div class="org-position">${org.position}</div>
            <p style="color: #64748b; margin-top: 0.5rem;">${org.bio}</p>
        </div>
    `).join("");
}

// تفاصيل الورش
function showWorkshopDetails(workshop) {
    const modal = document.getElementById("detailsModal");
    const modalContent = document.getElementById("modalContent");
    
    const details = {
        networking: {
            title: "ورشة الشبكات",
            description: "ورشة شاملة تغطي أساسيات الشبكات، بروتوكولات TCP/IP، أمن المعلومات، وإدارة الشبكات.",
            trainer: "تامر عماد - مشرف قسم الشبكات",
            time: "09:00 - 12:00",
            location: "مختبر الشبكات"
        },
        software: {
            title: "ورشة الـ Software",
            description: "ورشة تطوير التطبيقات تشمل مقدمة في البرمجة، تطوير الويب، وتقنيات الذكاء الاصطناعي.",
            trainer: "عمر محمد أحمد - مشرف قسم Software",
            time: "12:00 - 14:00",
            location: "مختبر البرمجة"
        },
        hardware: {
            title: "ورشة الـ Hardware",
            description: "ورشة عملية لبناء الحاسوب، التعرف على المكونات المادية، والصيانة الأساسية.",
            trainer: "عبدالله أسامة عبدالله - مشرف قسم Hardware",
            time: "14:00 - 16:00",
            location: "مختبر العتاد"
        },
        cultural: {
            title: "الحفل الثقافي",
            description: "حفل ختامي ، فقرات فنية ",
            trainer: "طلاب قسم تقانة المعلومات",
            time: "16:00 - 18:00",
            location: "القاعة الرئيسية"
        }
    };
    
    const d = details[workshop];
    modalContent.innerHTML = `
        <h2 style="color: #4f46e5;">${d.title}</h2>
        <p><i class="fas fa-user"></i> المدرب: ${d.trainer}</p>
        <p><i class="far fa-clock"></i> الوقت: ${d.time}</p>
        <p><i class="fas fa-map-marker-alt"></i> المكان: ${d.location}</p>
        <p style="margin-top: 1rem;">${d.description}</p>
        <button class="btn-primary" style="margin-top: 1.5rem; width: 100%;" onclick="closeModal(); document.getElementById('regWorkshop').value='${workshop}'; document.getElementById('registerBtn').click();">
            <i class="fas fa-ticket-alt"></i> سجل في هذه الورشة
        </button>
    `;
    
    modal.style.display = "flex";
}

function closeModal() {
    const modal = document.getElementById("detailsModal");
    modal.style.display = "none";
}

// 🔄 تحديث جميع البيانات (فريق العمل + اللجنة المنظمة)
function resetAllData() {
    if (confirm("⚠️ تحذير: هذا سيعيد تعيين جميع البيانات إلى القيم الافتراضية الجديدة!\n\nسيتم:\n✅ تحديث فريق العمل\n✅ تحديث اللجنة المنظمة\n✅ الاحتفاظ بالتسجيلات الحالية\n\nهل أنت متأكد؟")) {
        
        // حفظ التسجيلات الحالية مؤقتاً
        const currentRegistrations = getLocalRegistrations();
        
        // حفظ البيانات الجديدة
        localStorage.setItem(STORAGE_TEAM_MEMBERS, JSON.stringify(defaultTeamMembers));
        localStorage.setItem(STORAGE_ORGANIZERS, JSON.stringify(defaultOrganizers));
        
        // استعادة التسجيلات
        localStorage.setItem(STORAGE_REGISTRATIONS, JSON.stringify(currentRegistrations));
        
        // إعادة تحميل العرض
        renderTeamMembers();
        renderOrganizers();
        updateStats();
        
        alert("✅ تم تحديث جميع البيانات بنجاح!\n\n✅ فريق العمل\n✅ اللجنة المنظمة");
    }
}

// معالجة التسجيل
async function handleRegistration(event) {
    event.preventDefault();
    
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const phone = document.getElementById("regPhone").value;
    const major = document.getElementById("regMajor").value;
    const workshop = document.getElementById("regWorkshop").value;
    const messageDiv = document.getElementById("formMessage");
    
    if (!name || !email || !phone) {
        messageDiv.innerHTML = '<div class="form-message error">⚠️ الرجاء ملء جميع الحقول المطلوبة</div>';
        setTimeout(() => messageDiv.innerHTML = "", 3000);
        return;
    }
    
    messageDiv.innerHTML = '<div class="form-message" style="background:#e0e7ff; color:#3730a3;">⏳ جاري تسجيل بياناتك...</div>';
    
    const result = await addRegistration({
        name,
        email,
        phone,
        major,
        workshop
    });
    
    if (result.success) {
        messageDiv.innerHTML = `<div class="form-message success">
            ✅ تم تسجيلك بنجاح!<br>
            📊 ${result.googleSheetsStatus}
        </div>`;
        document.getElementById("registrationForm").reset();
    } else {
        messageDiv.innerHTML = '<div class="form-message error">❌ حدث خطأ في التسجيل، يرجى المحاولة مرة أخرى</div>';
    }
    
    setTimeout(() => {
        if (!messageDiv.innerHTML.includes("تم تسجيلك")) {
            messageDiv.innerHTML = "";
        }
    }, 5000);
}

// فلترة فريق العمل
function filterTeam(section) {
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(btn => btn.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    renderTeamMembers(section);
}

// القائمة المتنقلة
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) navLinks.classList.toggle('active');
}

// التمرير السلس
function smoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                document.querySelector('.nav-links')?.classList.remove('active');
            }
        });
    });
}

// تحديث الإحصائيات
function updateStats() {
    const registrations = getLocalRegistrations();
    const statsNumbers = document.querySelectorAll('.stat-number');
    if (statsNumbers[0]) statsNumbers[0].innerHTML = defaultTeamMembers.length + "+";
    if (statsNumbers[1]) statsNumbers[1].innerHTML = defaultOrganizers.length;
    if (statsNumbers[2]) statsNumbers[2].innerHTML = registrations.length;
}

// الوصول السري للمسؤول
function setupAdminAccess() {
    let clickCount = 0;
    let clickTimer = null;
    
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.style.cursor = "pointer";
        logo.addEventListener('click', () => {
            clickCount++;
            
            if (clickTimer) clearTimeout(clickTimer);
            
            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 1000);
            
            if (clickCount === 3) {
                showAdminLogin();
                clickCount = 0;
            }
        });
    }
    
    // طريقة سرية لتحديث البيانات (الضغط 5 مرات على الخلفية)
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        let resetCount = 0;
        let resetTimer = null;
        heroSection.addEventListener('click', () => {
            resetCount++;
            if (resetTimer) clearTimeout(resetTimer);
            resetTimer = setTimeout(() => {
                resetCount = 0;
            }, 2000);
            if (resetCount === 5) {
                resetAllData();
                resetCount = 0;
            }
        });
    }
}

// تهيئة الصفحة
document.addEventListener("DOMContentLoaded", () => {
    initDatabase();
    renderTeamMembers();
    renderOrganizers();
    updateStats();
    setupAdminAccess();
    
    // نموذج التسجيل
    const form = document.getElementById("registrationForm");
    if (form) form.addEventListener("submit", handleRegistration);
    
    // زر التسجيل الرئيسي
    const registerBtn = document.getElementById("registerBtn");
    if (registerBtn) {
        registerBtn.addEventListener("click", () => {
            document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
        });
    }
    
    // إغلاق النافذة المنبثقة
    const closeBtn = document.querySelector(".close-modal");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    
    window.addEventListener("click", (e) => {
        const modal = document.getElementById("detailsModal");
        if (e.target === modal) closeModal();
    });
    
    // القائمة المتنقلة
    const menuToggle = document.querySelector(".menu-toggle");
    if (menuToggle) menuToggle.addEventListener("click", toggleMenu);
    
    smoothScroll();
});

// جعل الدوال متاحة عالمياً
window.showWorkshopDetails = showWorkshopDetails;
window.filterTeam = filterTeam;
window.closeModal = closeModal;
window.resetAllData = resetAllData;
