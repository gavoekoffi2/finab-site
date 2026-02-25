/* ===== FINAB Chatbot IA ===== */

const chatbotToggle = document.getElementById('chatbotToggle');
const chatbotWindow = document.getElementById('chatbotWindow');
const chatbotClose = document.getElementById('chatbotClose');
const chatMessages = document.getElementById('chatbotMessages');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');

// Toggle chatbot
chatbotToggle.addEventListener('click', () => {
    chatbotWindow.classList.toggle('open');
    if (chatbotWindow.classList.contains('open')) chatInput.focus();
});
chatbotClose.addEventListener('click', () => chatbotWindow.classList.remove('open'));

// Suggestions
document.querySelectorAll('.suggestion').forEach(btn => {
    btn.addEventListener('click', () => {
        const msg = btn.dataset.msg;
        addMessage(msg, 'user');
        btn.parentElement.remove();
        processMessage(msg);
    });
});

// Send message
function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    chatInput.value = '';
    processMessage(text);
}

chatSend.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `chat-message ${sender}`;
    div.innerHTML = `<div class="chat-bubble">${text}</div>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
    const div = document.createElement('div');
    div.className = 'chat-message bot';
    div.id = 'typingIndicator';
    div.innerHTML = `<div class="chat-bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTyping() {
    document.getElementById('typingIndicator')?.remove();
}

// Knowledge base
const knowledge = {
    services: {
        keywords: ['service', 'offre', 'proposez', 'faites', 'quoi'],
        response: `Nous offrons plusieurs services :<br><br>
📋 <strong>Impôts & Taxes</strong> — Déclarations fiscales au Canada<br>
🛡️ <strong>Assurances</strong> — Auto, habitation, entreprise<br>
🎓 <strong>Formations</strong> — Éducation financière<br>
❤️ <strong>Protection Familiale</strong> — Assurance-vie, retraite (Afrique & Haïti)<br>
📊 <strong>Planification Financière</strong> — Stratégies personnalisées<br>
🌍 <strong>Services Internationaux</strong> — Diaspora africaine et haïtienne<br><br>
Souhaitez-vous en savoir plus sur un service en particulier ?`
    },
    impots: {
        keywords: ['impôt', 'impot', 'taxe', 'fiscal', 'déclaration'],
        response: `Nous sommes spécialistes des <strong>déclarations d'impôts au Canada</strong> 🇨🇦<br><br>
✅ Déclarations de revenus des particuliers<br>
✅ Impôts des entreprises<br>
✅ Optimisation des crédits et remboursements<br>
✅ Accompagnement personnalisé<br><br>
Nos experts maximisent vos remboursements. Voulez-vous <strong>prendre rendez-vous</strong> ?`
    },
    assurance: {
        keywords: ['assurance', 'auto', 'habitation', 'couverture', 'protéger'],
        response: `Nos services d'assurance couvrent :<br><br>
🚗 <strong>Assurance Auto</strong><br>
🏠 <strong>Assurance Habitation</strong><br>
🏢 <strong>Assurance Entreprise</strong><br>
❤️ <strong>Assurance Vie</strong><br><br>
Sam, notre expert en assurance, est reconnu comme l'un des meilleurs du domaine ! Voulez-vous une soumission ?`
    },
    rdv: {
        keywords: ['rendez-vous', 'rdv', 'rencontrer', 'disponible', 'consultation', 'prendre'],
        response: `Pour prendre rendez-vous avec un de nos experts :<br><br>
📞 Appelez-nous directement<br>
📧 Envoyez-nous un email à <strong>contact@finablasolution.com</strong><br>
📝 Ou remplissez le formulaire de contact sur cette page<br><br>
Nous vous répondrons dans les <strong>24 heures</strong>. Vous pouvez aussi faire votre <a href="#diagnostic" onclick="document.getElementById('chatbotWindow').classList.remove('open')"><strong>diagnostic financier gratuit</strong></a> !`
    },
    diagnostic: {
        keywords: ['diagnostic', 'évaluation', 'santé financière', 'bilan'],
        response: `Notre <strong>Diagnostic Financier Gratuit</strong> vous permet de :<br><br>
🔍 Évaluer votre situation financière actuelle<br>
📊 Identifier les opportunités d'optimisation<br>
💡 Recevoir des recommandations personnalisées<br><br>
👉 <a href="#diagnostic" onclick="document.getElementById('chatbotWindow').classList.remove('open')"><strong>Cliquez ici pour accéder au formulaire</strong></a>`
    },
    contact: {
        keywords: ['contact', 'joindre', 'appeler', 'email', 'téléphone', 'adresse'],
        response: `Voici comment nous joindre :<br><br>
📧 <strong>Email :</strong> contact@finablasolution.com<br>
🌐 <strong>Site :</strong> finablasolution.com<br>
📍 <strong>Présence :</strong> Canada, Afrique, Haïti<br><br>
Vous pouvez aussi remplir le <a href="#contact" onclick="document.getElementById('chatbotWindow').classList.remove('open')">formulaire de contact</a> et nous vous répondrons rapidement !`
    },
    formation: {
        keywords: ['formation', 'apprendre', 'cours', 'éducation', 'enseign'],
        response: `Nos <strong>programmes de formation</strong> incluent :<br><br>
📚 Formation financière pour particuliers<br>
🏢 Formation pour entreprises<br>
🌍 Programmes spéciaux pour nouveaux arrivants<br>
💰 Éducation à la planification de retraite<br><br>
Intéressé(e) ? Contactez-nous pour connaître les prochaines sessions !`
    },
    afrique: {
        keywords: ['afrique', 'africain', 'togo', 'continent'],
        response: `En <strong>Afrique</strong> 🌍, nous offrons :<br><br>
❤️ Protection des proches — assurance-vie adaptée<br>
💰 Plans de retraite pour commerçants et entrepreneurs<br>
🎓 Formations financières<br>
🤝 Accompagnement de la diaspora<br><br>
Notre mission : prouver qu'une maman qui vend le pain peut aussi planifier sa retraite !`
    },
    haiti: {
        keywords: ['haïti', 'haiti', 'haïtien'],
        response: `Pour les <strong>familles haïtiennes</strong> 🇭🇹 :<br><br>
Nous proposons des solutions financières dédiées, que vous soyez en Haïti ou dans la diaspora. Assurances, planification et accompagnement personnalisé.<br><br>
Contactez-nous pour en savoir plus !`
    },
    bonjour: {
        keywords: ['bonjour', 'salut', 'hello', 'hi', 'bonsoir', 'hey', 'coucou'],
        response: `Bonjour ! 👋 Bienvenue chez FINAB La Solution. Je suis votre assistant virtuel. Comment puis-je vous aider aujourd'hui ?<br><br>
Vous pouvez me poser des questions sur nos <strong>services</strong>, <strong>prendre rendez-vous</strong>, ou faire votre <strong>diagnostic financier</strong> !`
    },
    merci: {
        keywords: ['merci', 'thanks', 'super', 'parfait', 'génial', 'excellent'],
        response: `Merci à vous ! 🙏 N'hésitez pas si vous avez d'autres questions. Nous sommes là pour vous accompagner vers votre <strong>résurrection financière</strong> ! 💪`
    }
};

function processMessage(text) {
    showTyping();
    const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    let bestMatch = null;
    let bestScore = 0;
    
    for (const [key, data] of Object.entries(knowledge)) {
        let score = 0;
        for (const kw of data.keywords) {
            const kwNorm = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            if (lower.includes(kwNorm)) score++;
        }
        if (score > bestScore) { bestScore = score; bestMatch = data; }
    }
    
    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
        removeTyping();
        if (bestMatch && bestScore > 0) {
            addMessage(bestMatch.response, 'bot');
        } else {
            addMessage(`Merci pour votre message ! Pour une réponse personnalisée, je vous invite à :<br><br>
📝 <a href="#contact" onclick="document.getElementById('chatbotWindow').classList.remove('open')">Remplir notre formulaire de contact</a><br>
📞 Nous appeler directement<br>
📧 Nous écrire à <strong>contact@finablasolution.com</strong><br><br>
Un de nos experts vous répondra dans les meilleurs délais !`, 'bot');
        }
    }, delay);
}
