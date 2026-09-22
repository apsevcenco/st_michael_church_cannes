-- Seed initial content for the cookies, legal-notice and privacy-policy pages
-- so they are not blank before an admin reviews and edits them via /admin.html.
-- Legal-notice and privacy-policy contain bracketed placeholders where real
-- organization details (legal name, registration number, responsible person,
-- exact Supabase data region) must be filled in by the parish administrator.
-- Existing admin-managed records are never overwritten.

with seed_rows(page_key, language, section_key, title, body, sort_order) as (
  values
    -- Cookies

    ('cookies', 'ru', 'hero', 'Файлы cookie и похожие технологии', null, 10),
    ('cookies', 'ru', 'body', null, $q$<p><em>Дата последнего обновления: 22 сентября 2026 г.</em></p>
<h2>Что это такое</h2>
<p>Cookie — это небольшой файл, который сайт может сохранить в вашем браузере. На этом сайте мы не используем классические cookie-файлы отслеживания, но используем похожую технологию — <strong>localStorage</strong> браузера, — а также загружаем некоторые внешние сервисы, которые могут получать технические данные о вашем устройстве. Ниже мы честно перечисляем всё, что использует сайт.</p>
<h2>Что именно использует сайт</h2>
<p><strong>1. Статистика посещений (localStorage).</strong> При заходе на любую публичную страницу сайт сохраняет в localStorage вашего браузера случайный идентификатор посещения и дату первого визита. Это позволяет нам понимать, сколько людей посещают сайт, какие страницы популярны и заходят ли посетители повторно. Вместе с этим идентификатором мы записываем: адрес страницы, язык интерфейса, откуда вы перешли (referrer), тип устройства, браузер и операционную систему, часовой пояс и разрешение экрана. Мы не используем эти данные для рекламы, не продаём и не передаём их третьим лицам, не строим профиль пользователя для маркетинга.</p>
<p><strong>2. Вход администратора сайта.</strong> Страница входа для администратора использует сервис Supabase для входа по email и паролю. Он сохраняет в вашем браузере техническую сессию входа. Это касается только администраторов сайта, не обычных посетителей.</p>
<p><strong>3. Внешние сервисы, встроенные в страницы.</strong> Некоторые элементы сайта загружаются напрямую с серверов сторонних сервисов, и при их загрузке ваш браузер обращается к этим серверам напрямую (со своим IP-адресом), независимо от нашего сайта:</p>
<ul>
<li><strong>Google Fonts</strong> — используется для отображения декоративного шрифта на французской и английской версиях сайта;</li>
<li><strong>jsDelivr</strong> — используется для загрузки библиотеки Supabase, обеспечивающей работу сайта;</li>
<li><strong>OpenStreetMap</strong> — встроенная карта на странице «Контакты».</li>
</ul>
<p>Мы не встраиваем рекламные сети, счётчики социальных сетей и не используем cookie для ретаргетинга.</p>
<h2>Срок хранения</h2>
<p>Идентификатор посещения хранится в localStorage вашего браузера до тех пор, пока вы сами не очистите данные сайта в настройках браузера. Записи статистики посещений в нашей базе данных используются только в агрегированном виде для внутренней аналитики прихода.</p>
<h2>Как отказаться</h2>
<p>Вы можете в любой момент заблокировать localStorage и cookie для этого сайта в настройках браузера, очистить уже сохранённые данные сайта или использовать режим приватного просмотра. Это не повлияет на доступность текстов и фотографий на сайте — перестанет работать только внутренняя статистика посещений.</p>
<h2>Вопросы</h2>
<p>Если у вас есть вопросы об использовании данных на этом сайте, пожалуйста, свяжитесь с нами через страницу <a href="contacts.html">«Контакты»</a>.</p>$q$, 20),

    ('cookies', 'fr', 'hero', 'Cookies et technologies similaires', null, 10),
    ('cookies', 'fr', 'body', null, $q$<p><em>Dernière mise à jour : 22 septembre 2026.</em></p>
<h2>De quoi s'agit-il</h2>
<p>Un cookie est un petit fichier qu'un site peut enregistrer dans votre navigateur. Ce site n'utilise pas de cookies de suivi publicitaire classiques, mais utilise une technologie similaire — le <strong>localStorage</strong> de votre navigateur — et charge quelques services externes susceptibles de recevoir des données techniques sur votre appareil. Voici la liste complète et transparente de ce que le site utilise.</p>
<h2>Ce que le site utilise précisément</h2>
<p><strong>1. Statistiques de fréquentation (localStorage).</strong> Lors de votre visite sur une page publique, le site enregistre dans le localStorage de votre navigateur un identifiant de visite aléatoire et la date de votre première visite. Cela nous permet de savoir combien de personnes visitent le site, quelles pages sont les plus consultées et si les visiteurs reviennent. Avec cet identifiant, nous enregistrons également : la page consultée, la langue de l'interface, la page d'origine (referrer), le type d'appareil, le navigateur et le système d'exploitation, le fuseau horaire et la résolution d'écran. Nous n'utilisons jamais ces données à des fins publicitaires, nous ne les vendons pas et ne les transmettons pas à des tiers, et nous ne constituons pas de profil marketing des visiteurs.</p>
<p><strong>2. Connexion de l'administrateur du site.</strong> La page de connexion de l'administrateur utilise le service Supabase pour la connexion par email et mot de passe, qui enregistre une session technique dans votre navigateur. Cela ne concerne que les administrateurs du site, pas les visiteurs habituels.</p>
<p><strong>3. Services externes intégrés aux pages.</strong> Certains éléments du site sont chargés directement depuis les serveurs de services tiers ; lors de leur chargement, votre navigateur contacte directement ces serveurs (avec votre adresse IP), indépendamment de notre site :</p>
<ul>
<li><strong>Google Fonts</strong> — utilisé pour afficher la police décorative sur les versions française et anglaise du site ;</li>
<li><strong>jsDelivr</strong> — utilisé pour charger la bibliothèque Supabase nécessaire au fonctionnement du site ;</li>
<li><strong>OpenStreetMap</strong> — carte intégrée sur la page « Contacts ».</li>
</ul>
<p>Nous n'intégrons aucun réseau publicitaire, aucun bouton de réseau social traceur et n'utilisons aucun cookie de reciblage publicitaire.</p>
<h2>Durée de conservation</h2>
<p>L'identifiant de visite reste dans le localStorage de votre navigateur jusqu'à ce que vous effaciez vous-même les données du site. Les statistiques de fréquentation enregistrées dans notre base de données ne sont utilisées que sous forme agrégée, pour l'usage interne de la paroisse.</p>
<h2>Comment refuser</h2>
<p>Vous pouvez à tout moment bloquer le localStorage et les cookies pour ce site dans les paramètres de votre navigateur, effacer les données déjà enregistrées, ou utiliser le mode de navigation privée. Cela n'affecte en rien l'accès aux textes et photos du site — seules les statistiques internes cesseront de fonctionner correctement.</p>
<h2>Questions</h2>
<p>Pour toute question sur l'utilisation des données sur ce site, merci de nous contacter via la page <a href="contacts-fr.html">« Contacts »</a>.</p>$q$, 20),

    ('cookies', 'en', 'hero', 'Cookies and similar technologies', null, 10),
    ('cookies', 'en', 'body', null, $q$<p><em>Last updated: 22 September 2026.</em></p>
<h2>What this is about</h2>
<p>A cookie is a small file a website can store in your browser. This site does not use classic advertising tracking cookies, but it does use a similar technology — your browser's <strong>localStorage</strong> — and loads a few external services that may receive technical data about your device. Below is a full and honest list of what the site actually uses.</p>
<h2>What the site uses, exactly</h2>
<p><strong>1. Visit statistics (localStorage).</strong> When you visit any public page, the site stores a random visit identifier and the date of your first visit in your browser's localStorage. This lets us understand how many people visit the site, which pages are popular, and whether visitors return. Alongside this identifier, we also record: the page you viewed, the interface language, the referring page, your device and browser type, your time zone, and your screen resolution. We never use this data for advertising, we do not sell it or share it with third parties, and we do not build marketing profiles of visitors.</p>
<p><strong>2. Site administrator login.</strong> The admin login page uses the Supabase service for email/password login, which stores a technical login session in your browser. This only applies to site administrators, not regular visitors.</p>
<p><strong>3. External services embedded in the pages.</strong> Some elements of the site are loaded directly from third-party servers; when they load, your browser contacts those servers directly (with your IP address), independently of our site:</p>
<ul>
<li><strong>Google Fonts</strong> — used to display the decorative heading font on the French and English versions of the site;</li>
<li><strong>jsDelivr</strong> — used to load the Supabase library that powers the site;</li>
<li><strong>OpenStreetMap</strong> — the embedded map on the Contacts page.</li>
</ul>
<p>We do not embed advertising networks, social-media tracking widgets, or retargeting cookies.</p>
<h2>Retention period</h2>
<p>The visit identifier stays in your browser's localStorage until you clear the site's data yourself. Visit statistics stored in our database are only used in aggregated form for the parish's internal use.</p>
<h2>How to opt out</h2>
<p>You can, at any time, block localStorage and cookies for this site in your browser settings, clear data already stored, or use private/incognito browsing mode. This does not affect access to the site's texts and photos — only the internal visit statistics will stop working correctly.</p>
<h2>Questions</h2>
<p>If you have any questions about how data is used on this site, please get in touch via the <a href="contacts-en.html">Contacts</a> page.</p>$q$, 20),

    -- Legal notice

    ('legal-notice', 'ru', 'hero', 'Правовая информация о сайте', null, 10),
    ('legal-notice', 'ru', 'body', null, $q$<p><em>Дата последнего обновления: 22 сентября 2026 г.</em></p>
<h2>Издатель сайта</h2>
<p><strong>[Название организации — уточнить, например официальное название прихода или ассоциации]</strong><br>
Юридический адрес: 40 boulevard Alexandre III, 06400 Cannes, France [уточнить, если отличается]<br>
Регистрационный номер (RNA/SIRET, если применимо): [уточнить]<br>
Ответственный за публикацию: [ФИО, должность — уточнить]<br>
Контакты: см. страницу <a href="contacts.html">«Контакты»</a></p>
<h2>Хостинг</h2>
<p>Страницы сайта размещены на сервисе Render Services, Inc. (США) — <a href="https://render.com" target="_blank" rel="noopener">render.com</a>.</p>
<p>База данных, аутентификация и хранилище файлов работают на платформе Supabase Inc. (США) — <a href="https://supabase.com" target="_blank" rel="noopener">supabase.com</a>. Точный регион хранения данных: [уточнить].</p>
<h2>Интеллектуальная собственность</h2>
<p>Если не указано иное, тексты, фотографии и иные материалы сайта принадлежат приходу и защищены авторским правом. Отдельные исторические фотографии заимствованы из открытых источников (Wikimedia Commons) с указанием источника. Копирование материалов сайта без разрешения не допускается, за исключением случаев, предусмотренных законом.</p>
<h2>Ограничение ответственности</h2>
<p>Приход прилагает усилия для обеспечения точности информации на сайте, но не несёт ответственности за возможные неточности, а также за содержание внешних сайтов, на которые могут вести ссылки с этого сайта.</p>
<h2>Персональные данные</h2>
<p>Обработка персональных данных на этом сайте описана в <a href="privacy-policy.html">Политике конфиденциальности</a> и на странице <a href="cookies.html">Cookies</a>.</p>$q$, 20),

    ('legal-notice', 'fr', 'hero', 'Mentions légales', null, 10),
    ('legal-notice', 'fr', 'body', null, $q$<p><em>Dernière mise à jour : 22 septembre 2026.</em></p>
<h2>Éditeur du site</h2>
<p><strong>[Nom de l'organisation à compléter — par exemple le nom officiel de la paroisse ou de l'association]</strong><br>
Adresse : 40 boulevard Alexandre III, 06400 Cannes, France [à confirmer si différente]<br>
Numéro d'immatriculation (RNA/SIRET, le cas échéant) : [à compléter]<br>
Directeur de la publication : [nom, fonction — à compléter]<br>
Contact : voir la page <a href="contacts-fr.html">« Contacts »</a></p>
<h2>Hébergement</h2>
<p>Les pages du site sont hébergées par Render Services, Inc. (États-Unis) — <a href="https://render.com" target="_blank" rel="noopener">render.com</a>.</p>
<p>La base de données, l'authentification et le stockage de fichiers sont assurés par Supabase Inc. (États-Unis) — <a href="https://supabase.com" target="_blank" rel="noopener">supabase.com</a>. Région exacte d'hébergement des données : [à confirmer].</p>
<h2>Propriété intellectuelle</h2>
<p>Sauf mention contraire, les textes, photographies et autres contenus du site appartiennent à la paroisse et sont protégés par le droit d'auteur. Certaines photographies historiques proviennent de sources libres (Wikimedia Commons) avec mention de la source. Toute reproduction sans autorisation est interdite, sauf exceptions prévues par la loi.</p>
<h2>Limitation de responsabilité</h2>
<p>La paroisse s'efforce d'assurer l'exactitude des informations publiées sur le site, mais ne saurait être tenue responsable d'éventuelles inexactitudes, ni du contenu des sites externes vers lesquels ce site pourrait renvoyer.</p>
<h2>Données personnelles</h2>
<p>Le traitement des données personnelles sur ce site est décrit dans la <a href="privacy-policy-fr.html">Politique de confidentialité</a> et sur la page <a href="cookies-fr.html">Cookies</a>.</p>$q$, 20),

    ('legal-notice', 'en', 'hero', 'Legal Notice', null, 10),
    ('legal-notice', 'en', 'body', null, $q$<p><em>Last updated: 22 September 2026.</em></p>
<h2>Site publisher</h2>
<p><strong>[Organization name — to be completed, e.g. the official name of the parish or association]</strong><br>
Address: 40 boulevard Alexandre III, 06400 Cannes, France [confirm if different]<br>
Registration number (RNA/SIRET, if applicable): [to be completed]<br>
Publication director: [name, role — to be completed]<br>
Contact: see the <a href="contacts-en.html">Contacts</a> page</p>
<h2>Hosting</h2>
<p>The site's pages are hosted by Render Services, Inc. (United States) — <a href="https://render.com" target="_blank" rel="noopener">render.com</a>.</p>
<p>The database, authentication and file storage are provided by Supabase Inc. (United States) — <a href="https://supabase.com" target="_blank" rel="noopener">supabase.com</a>. Exact data hosting region: [to be confirmed].</p>
<h2>Intellectual property</h2>
<p>Unless otherwise noted, the texts, photographs and other content on this site belong to the parish and are protected by copyright. Some historical photographs are sourced from Wikimedia Commons, with attribution. Reproduction without permission is not allowed, except where permitted by law.</p>
<h2>Limitation of liability</h2>
<p>The parish makes reasonable efforts to keep the information on this site accurate, but cannot be held responsible for any inaccuracies, nor for the content of external sites this site may link to.</p>
<h2>Personal data</h2>
<p>How personal data is processed on this site is described in the <a href="privacy-policy-en.html">Privacy Policy</a> and on the <a href="cookies-en.html">Cookies</a> page.</p>$q$, 20),

    -- Privacy policy

    ('privacy-policy', 'ru', 'hero', 'Политика конфиденциальности', null, 10),
    ('privacy-policy', 'ru', 'body', null, $q$<p><em>Дата последнего обновления: 22 сентября 2026 г.</em></p>
<h2>Кто обрабатывает данные</h2>
<p>Ответственным за обработку персональных данных, собираемых на этом сайте, является [название организации — уточнить, то же лицо, что указано в разделе «Правовая информация»]. Контакты: см. страницу <a href="contacts.html">«Контакты»</a>.</p>
<h2>Какие данные мы обрабатываем</h2>
<p><strong>Посетители сайта.</strong> При посещении публичных страниц сайт сохраняет в вашем браузере (localStorage) случайный идентификатор посещения и записывает в базу данных: посещённую страницу, язык интерфейса, referrer, тип устройства и браузера, часовой пояс, разрешение экрана и дату первого визита. Подробности — на странице <a href="cookies.html">Cookies</a>.</p>
<p><strong>Администраторы сайта.</strong> Для входа в панель управления используется email и пароль через сервис Supabase Auth.</p>
<p>Мы не собираем на этом сайте имена, почтовые адреса или телефоны обычных посетителей через какие-либо формы.</p>
<h2>Цели и правовые основания обработки</h2>
<p>Данные о посещениях используются исключительно для внутренней статистики прихода (сколько человек посещает сайт, какие страницы популярны) на основании законного интереса прихода в развитии сайта. Данные администраторов обрабатываются для обеспечения безопасного доступа к управлению сайтом.</p>
<h2>Кто получает данные</h2>
<p>Данные обрабатываются с помощью следующих поставщиков услуг (субподрядчиков обработки):</p>
<ul>
<li>Render Services, Inc. — хостинг сайта и сервера;</li>
<li>Supabase Inc. — база данных и аутентификация.</li>
</ul>
<p>Мы не продаём и не передаём данные посетителей рекламным или маркетинговым компаниям.</p>
<h2>Срок хранения</h2>
<p>Идентификатор посещения хранится в localStorage вашего браузера до тех пор, пока вы сами его не удалите. Записи статистики в базе данных хранятся [срок — уточнить, рекомендуется не более 13 месяцев] и используются в агрегированном виде.</p>
<h2>Передача данных за пределы ЕС</h2>
<p>Используемые нами поставщики услуг могут обрабатывать данные за пределами Европейского союза. [Уточнить конкретный регион хранения данных Supabase и наличие гарантий по Статье 46 GDPR / Standard Contractual Clauses.]</p>
<h2>Ваши права</h2>
<p>В соответствии с GDPR и французским Законом «Informatique et Libertés», вы имеете право на доступ к своим данным, их исправление, удаление, ограничение обработки, возражение против обработки и переносимость данных. Для реализации этих прав обращайтесь через страницу <a href="contacts.html">«Контакты»</a>. Вы также вправе подать жалобу в контролирующий орган — французскую CNIL (www.cnil.fr).</p>
<h2>Изменения политики</h2>
<p>Мы можем время от времени обновлять эту политику. Дата последнего обновления указана в начале документа.</p>$q$, 20),

    ('privacy-policy', 'fr', 'hero', 'Politique de confidentialité', null, 10),
    ('privacy-policy', 'fr', 'body', null, $q$<p><em>Dernière mise à jour : 22 septembre 2026.</em></p>
<h2>Qui traite les données</h2>
<p>Le responsable du traitement des données personnelles collectées sur ce site est [nom de l'organisation à compléter — la même entité que celle indiquée dans les Mentions légales]. Contact : voir la page <a href="contacts-fr.html">« Contacts »</a>.</p>
<h2>Quelles données nous traitons</h2>
<p><strong>Visiteurs du site.</strong> Lors de la visite des pages publiques, le site enregistre dans votre navigateur (localStorage) un identifiant de visite aléatoire et enregistre dans la base de données : la page consultée, la langue de l'interface, la page d'origine (referrer), le type d'appareil et de navigateur, le fuseau horaire, la résolution d'écran et la date de première visite. Détails sur la page <a href="cookies-fr.html">Cookies</a>.</p>
<p><strong>Administrateurs du site.</strong> La connexion à l'espace d'administration utilise un email et un mot de passe via le service Supabase Auth.</p>
<p>Nous ne collectons sur ce site aucun nom, adresse postale ou numéro de téléphone de visiteur ordinaire via un quelconque formulaire.</p>
<h2>Finalités et bases légales du traitement</h2>
<p>Les données de fréquentation sont utilisées exclusivement pour les statistiques internes de la paroisse (nombre de visiteurs, pages les plus consultées), sur la base de l'intérêt légitime de la paroisse à faire évoluer son site. Les données des administrateurs sont traitées afin de sécuriser l'accès à la gestion du site.</p>
<h2>Destinataires des données</h2>
<p>Les données sont traitées à l'aide des sous-traitants suivants :</p>
<ul>
<li>Render Services, Inc. — hébergement du site et des serveurs ;</li>
<li>Supabase Inc. — base de données et authentification.</li>
</ul>
<p>Nous ne vendons ni ne transmettons les données des visiteurs à des sociétés publicitaires ou marketing.</p>
<h2>Durée de conservation</h2>
<p>L'identifiant de visite reste dans le localStorage de votre navigateur jusqu'à ce que vous le supprimiez vous-même. Les statistiques enregistrées en base de données sont conservées [durée à préciser, 13 mois maximum recommandé] et utilisées sous forme agrégée.</p>
<h2>Transferts de données hors de l'UE</h2>
<p>Les prestataires que nous utilisons peuvent traiter des données en dehors de l'Union européenne. [À compléter : région exacte d'hébergement des données Supabase et garanties prévues à l'article 46 du RGPD / clauses contractuelles types.]</p>
<h2>Vos droits</h2>
<p>Conformément au RGPD et à la loi « Informatique et Libertés », vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité de vos données. Pour exercer ces droits, contactez-nous via la page <a href="contacts-fr.html">« Contacts »</a>. Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).</p>
<h2>Modifications de la politique</h2>
<p>Cette politique peut être mise à jour périodiquement. La date de dernière mise à jour figure en haut de ce document.</p>$q$, 20),

    ('privacy-policy', 'en', 'hero', 'Privacy Policy', null, 10),
    ('privacy-policy', 'en', 'body', null, $q$<p><em>Last updated: 22 September 2026.</em></p>
<h2>Who processes the data</h2>
<p>The data controller for personal data collected on this site is [organization name — to be completed, the same entity named in the Legal Notice]. Contact: see the <a href="contacts-en.html">Contacts</a> page.</p>
<h2>What data we process</h2>
<p><strong>Site visitors.</strong> When you visit public pages, the site stores a random visit identifier in your browser (localStorage) and records in the database: the page viewed, interface language, referring page, device and browser type, time zone, screen resolution, and the date of your first visit. Details on the <a href="cookies-en.html">Cookies</a> page.</p>
<p><strong>Site administrators.</strong> Logging into the admin panel uses an email and password via the Supabase Auth service.</p>
<p>We do not collect names, postal addresses, or phone numbers from regular visitors through any form on this site.</p>
<h2>Purposes and legal basis</h2>
<p>Visit data is used solely for the parish's internal statistics (how many people visit, which pages are popular), on the basis of the parish's legitimate interest in developing its website. Administrator data is processed to secure access to site management.</p>
<h2>Who receives the data</h2>
<p>Data is processed with the help of the following service providers (data processors):</p>
<ul>
<li>Render Services, Inc. — website and server hosting;</li>
<li>Supabase Inc. — database and authentication.</li>
</ul>
<p>We do not sell or share visitor data with advertising or marketing companies.</p>
<h2>Retention period</h2>
<p>The visit identifier stays in your browser's localStorage until you delete it yourself. Statistics stored in the database are kept for [retention period to be specified, 13 months maximum recommended] and used in aggregated form.</p>
<h2>Transfers outside the EU</h2>
<p>The service providers we use may process data outside the European Union. [To be completed: the exact region where Supabase hosts the data, and the safeguards in place under GDPR Article 46 / Standard Contractual Clauses.]</p>
<h2>Your rights</h2>
<p>Under the GDPR, you have the right to access, rectify, erase, restrict, object to, and port your data. To exercise these rights, contact us via the <a href="contacts-en.html">Contacts</a> page. You may also lodge a complaint with the French data protection authority, the CNIL (www.cnil.fr).</p>
<h2>Changes to this policy</h2>
<p>We may update this policy from time to time. The date of the last update appears at the top of this document.</p>$q$, 20)
)
insert into public.content_sections
  (page_key, language, section_key, title, summary, body, status, sort_order)
select
  page_key,
  language,
  section_key,
  nullif(title, ''),
  null,
  body,
  'published',
  sort_order
from seed_rows seed
where not exists (
  select 1
  from public.content_sections existing
  where existing.page_key = seed.page_key
    and existing.language = seed.language
    and existing.section_key = seed.section_key
);
