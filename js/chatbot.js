/* ===== FINAB Chatbot IA ===== */
(function () {
    'use strict';

    var chatbotToggle = document.getElementById('chatbotToggle');
    var chatbotWindow = document.getElementById('chatbotWindow');
    var chatbotClose = document.getElementById('chatbotClose');
    var chatMessages = document.getElementById('chatbotMessages');
    var chatInput = document.getElementById('chatInput');
    var chatSend = document.getElementById('chatSend');

    // Sans le balisage du chatbot (autres pages), on ne fait rien plutôt
    // que de planter le script sur un élément manquant.
    if (!chatbotToggle || !chatbotWindow || !chatMessages || !chatInput || !chatSend) return;

    /* ===== Ouverture / fermeture ===== */
    function setOpen(open) {
        chatbotWindow.classList.toggle('open', open);
        chatbotToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) chatInput.focus();
    }

    chatbotToggle.setAttribute('aria-expanded', 'false');
    chatbotToggle.addEventListener('click', function () {
        setOpen(!chatbotWindow.classList.contains('open'));
    });
    if (chatbotClose) {
        chatbotClose.addEventListener('click', function () { setOpen(false); });
    }
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && chatbotWindow.classList.contains('open')) setOpen(false);
    });

    /* ===== Affichage des messages ===== */
    // Le texte saisi par le visiteur est échappé : il ne doit jamais être
    // interprété comme du HTML.
    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function addMessage(html, sender) {
        var div = document.createElement('div');
        div.className = 'chat-message ' + sender;
        div.innerHTML = '<div class="chat-bubble">' + html + '</div>';
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addUserMessage(text) {
        addMessage(escapeHtml(text), 'user');
    }

    function showTyping() {
        removeTyping();
        var div = document.createElement('div');
        div.className = 'chat-message bot';
        div.id = 'typingIndicator';
        div.innerHTML = '<div class="chat-bubble"><div class="typing-indicator">' +
            '<span></span><span></span><span></span></div></div>';
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTyping() {
        var el = document.getElementById('typingIndicator');
        if (el) el.remove();
    }

    /* ===== Envoi ===== */
    function sendMessage() {
        var text = chatInput.value.trim();
        if (!text) return;
        addUserMessage(text);
        chatInput.value = '';
        processMessage(text);
    }

    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    /* ===== Suggestions rapides ===== */
    document.querySelectorAll('.suggestion').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var msg = btn.dataset.msg;
            if (!msg) return;
            addUserMessage(msg);
            var group = btn.closest('.chat-suggestions');
            if (group) group.remove();
            processMessage(msg);
        });
    });

    /* ===== Liens contenus dans les réponses ===== */
    // Un lien interne ferme la fenêtre et fait défiler la page proprement.
    chatMessages.addEventListener('click', function (e) {
        var link = e.target.closest ? e.target.closest('a[href^="#"]') : null;
        if (!link) return;
        var href = link.getAttribute('href');
        if (!href || href === '#') return;
        var target = document.getElementById(href.slice(1));
        if (!target) return;
        e.preventDefault();
        setOpen(false);
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Le chatbot est présent sur plusieurs pages : le lien interne doit
    // rester valide depuis la racine comme depuis /pages/.
    function medicalPageUrl() {
        return /\/pages\//.test(window.location.pathname)
            ? 'coordination-medicale.html'
            : 'pages/coordination-medicale.html';
    }

    /* ===== Base de connaissances ===== */
    var knowledge = {
        services: {
            keywords: ['service', 'offre', 'proposez', 'que faites', 'prestation'],
            response: 'Nous offrons plusieurs services :<br><br>' +
'📋 <strong>Impôts &amp; Taxes</strong> — Déclarations fiscales au Canada<br>' +
'🛡️ <strong>Assurances</strong> — Auto, habitation, entreprise<br>' +
'🎓 <strong>Formations</strong> — Éducation financière<br>' +
'❤️ <strong>Protection Familiale</strong> — Assurance-vie, retraite (Afrique &amp; Haïti)<br>' +
'📊 <strong>Planification Financière</strong> — Stratégies personnalisées<br>' +
'🌍 <strong>Services Internationaux</strong> — Diaspora africaine et haïtienne<br>' +
'🏥 <strong>Coordination Médicale</strong> — Accès aux soins au Canada<br><br>' +
'Souhaitez-vous en savoir plus sur un service en particulier ?'
        },
        impots: {
            keywords: ['impot', 'taxe', 'fiscal', 'declaration', 'remboursement'],
            response: 'Nous sommes spécialistes des <strong>déclarations d\'impôts au Canada</strong> 🇨🇦<br><br>' +
'✅ Déclarations de revenus des particuliers<br>' +
'✅ Impôts des entreprises<br>' +
'✅ Optimisation des crédits et remboursements<br>' +
'✅ Accompagnement personnalisé<br><br>' +
'Nos experts maximisent vos remboursements. Voulez-vous <strong>prendre rendez-vous</strong> ?'
        },
        assurance: {
            keywords: ['assurance', 'assurer', 'auto', 'habitation', 'couverture', 'proteger', 'soumission'],
            response: 'Nos services d\'assurance couvrent :<br><br>' +
'🚗 <strong>Assurance Auto</strong><br>' +
'🏠 <strong>Assurance Habitation</strong><br>' +
'🏢 <strong>Assurance Entreprise</strong><br>' +
'❤️ <strong>Assurance Vie</strong><br><br>' +
'Sam, notre expert en assurance, est reconnu comme l\'un des meilleurs du domaine ! Voulez-vous une soumission ?'
        },
        rdv: {
            keywords: ['rendez-vous', 'rendez vous', 'rdv', 'rencontrer', 'consultation', 'disponibilite'],
            response: 'Pour prendre rendez-vous avec un de nos experts :<br><br>' +
'📧 Écrivez-nous à <strong>contact@finablasolution.com</strong><br>' +
'📝 Ou remplissez le <a href="#contact">formulaire de contact</a> de cette page<br><br>' +
'Nous vous répondrons dans les <strong>24 heures</strong>. Vous pouvez aussi faire votre ' +
'<a href="#diagnostic"><strong>diagnostic financier gratuit</strong></a> !'
        },
        diagnostic: {
            keywords: ['diagnostic', 'evaluation', 'sante financiere', 'bilan'],
            response: 'Notre <strong>Diagnostic Financier Gratuit</strong> vous permet de :<br><br>' +
'🔍 Évaluer votre situation financière actuelle<br>' +
'📊 Identifier les opportunités d\'optimisation<br>' +
'💡 Recevoir des recommandations personnalisées<br><br>' +
'👉 <a href="#diagnostic"><strong>Cliquez ici pour accéder au formulaire</strong></a>'
        },
        contact: {
            keywords: ['contact', 'joindre', 'appeler', 'email', 'courriel', 'telephone', 'adresse', 'ecrire'],
            response: 'Voici comment nous joindre :<br><br>' +
'📧 <strong>Email :</strong> <a href="mailto:contact@finablasolution.com">contact@finablasolution.com</a><br>' +
'🌐 <strong>Site :</strong> finablasolution.com<br>' +
'📍 <strong>Présence :</strong> Canada, Afrique, Haïti<br><br>' +
'Vous pouvez aussi remplir le <a href="#contact">formulaire de contact</a> et nous vous répondrons rapidement !'
        },
        formation: {
            keywords: ['formation', 'apprendre', 'cours', 'education', 'enseign', 'atelier'],
            response: 'Nos <strong>programmes de formation</strong> incluent :<br><br>' +
'📚 Formation financière pour particuliers<br>' +
'🏢 Formation pour entreprises<br>' +
'🌍 Programmes spéciaux pour nouveaux arrivants<br>' +
'💰 Éducation à la planification de retraite<br><br>' +
'Intéressé(e) ? Contactez-nous pour connaître les prochaines sessions !'
        },
        medical: {
            keywords: ['medical', 'medecin', 'sante', 'soin', 'hopital', 'clinique', 'patient', 'traitement'],
            response: 'Notre service de <strong>Coordination Médicale Internationale</strong> 🏥 accompagne ' +
'les patients d\'Afrique vers les soins spécialisés au Canada :<br><br>' +
'📋 Analyse du dossier médical<br>' +
'🏥 Mise en relation avec les établissements<br>' +
'✈️ Logistique, visa et hébergement<br>' +
'❤️ Suivi post-traitement<br><br>' +
'👉 <a href="' + medicalPageUrl() + '">Découvrir la page Coordination Médicale</a>'
        },
        afrique: {
            keywords: ['afrique', 'africain', 'togo', 'congo', 'rdc', 'continent'],
            response: 'En <strong>Afrique</strong> 🌍, nous offrons :<br><br>' +
'❤️ Protection des proches — assurance-vie adaptée<br>' +
'💰 Plans de retraite pour commerçants et entrepreneurs<br>' +
'🎓 Formations financières<br>' +
'🤝 Accompagnement de la diaspora<br><br>' +
'Notre mission : prouver qu\'une maman qui vend le pain peut aussi planifier sa retraite !'
        },
        haiti: {
            keywords: ['haiti', 'haitien'],
            response: 'Pour les <strong>familles haïtiennes</strong> 🇭🇹 :<br><br>' +
'Nous proposons des solutions financières dédiées, que vous soyez en Haïti ou dans la diaspora. ' +
'Assurances, planification et accompagnement personnalisé.<br><br>' +
'Contactez-nous pour en savoir plus !'
        },
        bonjour: {
            keywords: ['bonjour', 'salut', 'hello', 'bonsoir', 'hey', 'coucou', 'bonne journee'],
            response: 'Bonjour ! 👋 Bienvenue chez FINAB La Solution. Je suis votre assistant virtuel. ' +
'Comment puis-je vous aider aujourd\'hui ?<br><br>' +
'Vous pouvez me poser des questions sur nos <strong>services</strong>, ' +
'<strong>prendre rendez-vous</strong>, ou faire votre <strong>diagnostic financier</strong> !'
        },
        merci: {
            keywords: ['merci', 'thanks', 'parfait', 'genial', 'excellent', 'au revoir'],
            response: 'Merci à vous ! 🙏 N\'hésitez pas si vous avez d\'autres questions. Nous sommes là pour ' +
'vous accompagner vers votre <strong>résurrection financière</strong> ! 💪'
        }
    };

    function normalize(text) {
        return String(text)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }

    function processMessage(text) {
        showTyping();
        var lower = normalize(text);

        var bestMatch = null;
        var bestScore = 0;

        Object.keys(knowledge).forEach(function (key) {
            var data = knowledge[key];
            var score = 0;
            data.keywords.forEach(function (kw) {
                var kwNorm = normalize(kw);
                // Les mots-clés longs pèsent plus lourd : « assurance habitation »
                // ne doit pas être battu par une correspondance fortuite.
                if (lower.indexOf(kwNorm) !== -1) score += kwNorm.length;
            });
            if (score > bestScore) {
                bestScore = score;
                bestMatch = data;
            }
        });

        var delay = 700 + Math.random() * 800;
        setTimeout(function () {
            removeTyping();
            if (bestMatch) {
                addMessage(bestMatch.response, 'bot');
            } else {
                addMessage('Merci pour votre message ! Pour une réponse personnalisée, je vous invite à :<br><br>' +
'📝 <a href="#contact">Remplir notre formulaire de contact</a><br>' +
'📧 Nous écrire à <a href="mailto:contact@finablasolution.com">contact@finablasolution.com</a><br><br>' +
'Un de nos experts vous répondra dans les meilleurs délais !', 'bot');
            }
        }, delay);
    }
})();
