-- Seed editable CMS content extracted from the committed static pages.
-- Run this in Supabase SQL Editor after the CMS tables migration.
-- It replaces seeded content for the listed pages/languages.

delete from public.content_sections
where page_key in ('baptism', 'communion', 'confession', 'contacts', 'home', 'help', 'history', 'meeting', 'news', 'notes', 'sacraments', 'schedule', 'visit', 'wedding');

insert into public.content_sections
  (page_key, language, section_key, title, summary, body, status, sort_order)
values
('baptism','en','hero','Baptism','','','published',1),
('baptism','en','body','Baptism','For the baptism of a child or adult, a prior conversation with the priest is needed.','Baptism

For the baptism of a child or adult, a prior conversation with the priest is needed.','published',10),
('baptism','fr','hero','Baptême','','','published',1),
('baptism','fr','body','Baptême','Pour un baptême d''enfant ou d''adulte, un entretien préalable avec le prêtre est nécessaire.','Baptême

Pour un baptême d''enfant ou d''adulte, un entretien préalable avec le prêtre est nécessaire.','published',10),
('baptism','ru','hero','Крещение','','','published',1),
('baptism','ru','body','Крещение','Для крещения ребёнка или взрослого нужна предварительная беседа со священником.','Крещение

Для крещения ребёнка или взрослого нужна предварительная беседа со священником.','published',10),
('communion','en','hero','Communion','','','published',1),
('communion','en','body','Communion','Participation in the Eucharist is the centre of Church life.','Communion

Participation in the Eucharist is the centre of Church life.','published',10),
('communion','fr','hero','Communion','','','published',1),
('communion','fr','body','Communion','La communion eucharistique est au centre de la vie de l''Église.','Communion

La communion eucharistique est au centre de la vie de l''Église.','published',10),
('communion','ru','hero','Причастие','','','published',1),
('communion','ru','body','Причастие','Евхаристия является сердцем Божественной литургии и центром церковной жизни.','Причастие

«Если не будете есть Плоти Сына Человеческого и пить Крови Его, то не будете иметь в себе жизни» (Ин. 6, 53).

«Чаша, которую подал Христос ученикам, немного содержала в себе пития, но весьма велика ее сила, и она не иссякает». Преподобный Ефрем Сирин.

Кто может приступать к Причастию?

К Святой Чаше приступают крещеные православные христиане. Главными условиями участия в Евхаристии являются живая вера, желание соединиться со Христом и благоговение перед величайшей Святыней.

Как правильно подготовиться к Причастию?

Прежде Причастия христианин старается примириться с ближними, простить обиды и не представать перед Чашей со злобой, враждой или осуждением. Перед Причащением христианин традиционно старается попасть на Исповедь.

Накануне Причастия христианин говеет: с полуночи перед Причащением обычно не едят и не пьют, кроме случаев болезни и необходимости приема лекарств. Самых юных прихожан эти ограничения не касаются.

Полезно заранее ограничить развлечения, суету и рассеянность, чтобы душа с большей чуткостью и вниманием отнеслась к таинству соединения со Христом.

В дни подготовки, помимо утренних и вечерних молитв, читается Последование ко Святому Причащению.

Крайне важно подходить к Чаше не по привычке и не «для галочки», а с любовью, благоговением и верой в то, что перед нами истинные Тело и Кровь Спасителя.

Богословский смысл Таинства

Евхаристия, что в переводе с греческого означает «благодарение», является сердцем Божественной литургии и центром богослужебной жизни Церкви. В этом Таинстве хлеб и вино силою Святого Духа становятся истинными Телом и Кровью Христовыми.

Причащаясь, человек принимает не символ и не воспоминание, а Самого Христа — Источника бессмертия. Через Святую Чашу Господь врачует душу и тело, укрепляет ослабевшую волю и подает силы для борьбы с грехом.

Евхаристия соединяет верующего не только со Христом, но и со всей Церковью, поскольку все причащаются от Единой Чаши. Поэтому Причастие — это Таинство церковного единства.','published',10),
('confession','en','hero','Confession','','','published',1),
('confession','en','body','Confession','Confession is usually heard before the Liturgy or by arrangement.','Confession

Confession is usually heard before the Liturgy or by arrangement.','published',10),
('confession','fr','hero','Confession','','','published',1),
('confession','fr','body','Confession','La confession a lieu avant la Liturgie ou sur rendez-vous.','Confession

La confession a lieu avant la Liturgie ou sur rendez-vous.','published',10),
('confession','ru','hero','Исповедь','','','published',1),
('confession','ru','body','Исповедь','Таинство возвращения человека к Богу через покаяние, примирение и разрешительную молитву Церкви.','Исповедь

«Покайтесь, ибо приблизилось Царство Небесное» (Мф. 4,17).

«Если говорим, что не имеем греха, — обманываем самих себя, и истины нет в нас. Если исповедуем грехи наши, то Он, будучи верен и праведен, простит нам грехи наши и очистит нас от всякой неправды» (1 Ин. 1,9).

Кто может исповедываться?

К Таинству Исповеди приступает крещеный православный христианин, желающий не просто перечислить свои прегрешения, а, покаявшись, примириться с Богом, Церковью и собственной совестью.

Как готовиться к Исповеди?

Подлинная подготовка к таинству начинается с честного взгляда на свою жизнь: в чем я согрешил перед Богом, ближними и самим собой? Полезно заранее спокойно вспомнить свои грехи.

Тем, кто исповедуется впервые или делает это после долгого перерыва, можно записать самое важное на лист бумаги. На Исповеди лучше назвать грех просто, прямо и без самооправдания.

Перед Исповедью важно постараться простить обидчиков, попросить прощения у тех, кого мы ранили, и по возможности исправить причиненный вред. Исповедь принимается Богом, а священник является свидетелем Покаяния.

Трехдневный пост перед Причастием является также временем трезвенности и искреннего желания исправиться.

Богословский смысл Исповеди

Исповедь — это не формальность, не психологическая беседа и не «пропускной билет ко Причастию», но Таинство возвращения человека к Богу. Грех разрушает живую связь с Господом, затемняет ум и ожесточает сердце.

Покаяние, по-гречески «метанойя», означает перемену ума — внутренний разворот от греха к Богу. В Таинстве Исповеди человек признает свою вину, получает прощение и благодатную силу начать новую жизнь.

В нашей общине Исповедь проходит перед началом Литургии с 9:30 до 10:00, а также непосредственно перед Причастием в формате общей исповеди.','published',10),
('contacts','en','hero','Contacts','','','published',1),
('contacts','en','body','Contacts','Church address, map and parish contact phone.','40 boulevard Alexandre III
06400 Cannes, France
For additional information, please contact Fr Georges Sheshko.
+33 6 84 65 71 85','published',10),
('contacts','fr','hero','Contacts','','','published',1),
('contacts','fr','body','Contacts','Adresse de l??glise, carte et t?l?phone de contact paroissial.','40 boulevard Alexandre III
06400 Cannes, France
Pour plus d?informations, veuillez contacter le p?re Georges Sheshko.
+33 6 84 65 71 85','published',10),
('contacts','ru','hero','Контакты','','','published',1),
('contacts','ru','body','Контакты','Адрес храма, карта, телефон для связи и маршрут для прихожан и гостей Канн.','40 boulevard Alexandre III
06400 Cannes, France

За дополнительной информацией обращаться к священнику Георгию Шешко.

+33 6 84 65 71 85','published',10),
('home','en','hero','St Michael the Archangel Church in Cannes','','','published',1),
('home','en','body','St Michael the Archangel Church in Cannes','','Parish today

A living site for parishioners, pilgrims and visitors to Cannes

The home page leads to practical sections: services, sacraments, history, visiting, support and contacts. Every link opens a full page in the selected language.','published',10),
('home','fr','hero','Paroisse Saint-Michel-Archange à Cannes','','','published',1),
('home','fr','body','Paroisse Saint-Michel-Archange à Cannes','','La paroisse aujourd''hui

Un site vivant pour les fidèles, pèlerins et visiteurs de Cannes

La page d''accueil mène aux sections pratiques: horaires, sacrements, histoire, visite, soutien et contacts. Chaque lien ouvre une page complète dans la langue choisie.','published',10),
('help','en','hero','Support the church','','','published',1),
('help','en','body','Support the church','Donations support liturgical life, restoration works and parish projects.','Bank details

Current bank details can be managed from the admin panel.

Online donation

An online donation button can be connected later through Stripe, Mollie or PayPal.','published',10),
('help','fr','hero','Aider la paroisse','','','published',1),
('help','fr','body','Aider la paroisse','Les dons soutiennent la vie liturgique, les travaux de restauration et les projets paroissiaux.','Coordonn?es bancaires

Les coordonn?es bancaires actuelles peuvent ?tre g?r?es depuis l?administration.

Don en ligne

Un bouton de paiement pourra ?tre reli? ensuite ? Stripe, Mollie ou PayPal.','published',10),
('help','ru','hero','Помочь храму','','','published',1),
('help','ru','body','Помочь храму','Пожертвования поддерживают богослужебную жизнь, реставрационные работы и приходские проекты.','Банковские реквизиты

Актуальные реквизиты прихода можно разместить и обновлять через админку в разделе «Помощь».

Онлайн-пожертвование

Кнопка онлайн-оплаты будет подключена после выбора платежной платформы: Stripe, Mollie или PayPal.','published',10),
('history','en','hero','History of St Michael the Archangel Church in Cannes','','','published',1),
('history','en','body','History of St Michael the Archangel Church in Cannes','The Russian colony on the Riviera, construction, crypt, restoration and photographic archive.','The church grew out of the life of the Russian colony in Cannes in the second half of the nineteenth century. The Tripet-Skrypitzine family, Villa Alexandra and its domestic chapel preceded the construction of the parish church. In 1894 a building committee was formed with Grand Duke Michael Mikhailovich and Archpriest Gregory Ostroumov. Architect Louis Nouveau designed a Greek-cross church with a bell tower, Russian motifs and a blue dome. In the twentieth century the parish lived through emigration, jurisdictional changes, war and restoration.','published',10),
('history','fr','hero','Histoire de l''église Saint-Michel-Archange à Cannes','','','published',1),
('history','fr','body','Histoire de l''église Saint-Michel-Archange à Cannes','La colonie russe de la Côte d''Azur, la construction, la crypte, les restaurations et les archives photographiques.','L''église est née de la vie de la colonie russe de Cannes dans la seconde moitié du XIXe siècle. La famille Tripet-Skrypitzine, la villa Alexandra et la chapelle domestique ont précédé la construction de la grande église paroissiale. En 1894, un comité de construction fut formé avec le grand-duc Michel Mikhaïlovitch et l''archiprêtre Grégoire Ostroumov. L''architecte Louis Nouveau conçut une église en forme de croix grecque avec clocher, motifs russes et coupole bleue. Au XXe siècle, la paroisse traversa l''exil, les changements juridictionnels, la guerre et les restaurations.','published',10),
('history','ru','hero','История храма Архангела Михаила в Каннах','','','published',1),
('history','ru','body','История храма Архангела Михаила в Каннах','Русская колония Лазурного Берега, строительство храма, судьба прихода, крипта, реставрация и фотоархив.','История храма в честь Архангела Михаила в Каннах восходит к середине XIX столетия, когда Лазурный Берег постепенно становился одним из излюбленных мест пребывания европейской и русской аристократии. В 1848 году французский дипломат Эжен-Франсуа Трипе вместе со своей супругой Александрой, урождённой Скрипицыной, происходившей из состоятельной русской семьи, обосновался в Каннах. В то время город ещё сохранял особую тишину и средиземноморскую размеренность. Один из путеводителей той эпохи отмечал, что «сравнительно с Ниццею, жизнь в Каннах более тихая, правильная, барственная», а местное общество, изящное и сдержанное, состояло преимущественно из аристократии и состоятельных людей.

Для православных жителей и гостей Канн ближайшим храмом долгое время оставалась церковь святых Николая и Александры в Ницце. Однако дорога туда была неудобной, особенно для тех, кто проводил в Каннах зимние месяцы или краткосрочный отпуск. Поэтому в 1886 году госпожа Александра Трипе устроила на своей недавно построенной вилле «Александра» небольшую домовую церковь. Она могла вместить не более тридцати человек, но именно с неё началась регулярная православная молитвенная жизнь в Каннах. На освящении этой первой домовой церкви присутствовала великая княгиня Анастасия Михайловна вместе со своим супругом, великим герцогом Фридрихом-Францем Мекленбург-Шверинским. Духовник великой княгини, священник Григорий Остроумов, стал совершать здесь регулярные богослужения.

Очень скоро стало очевидно, что маленькая домовая церковь уже не вмещает всех представителей растущей местной русской общины. В 1893 году протоиерей Григорий Остроумов обратился к великому князю Михаилу Михайловичу Романову, который был женат на внучке Александра Сергеевича Пушкина, Софии Меренберг, и проводил зимние месяцы в Каннах на своей вилле «Казбек». Священник просил великого князя оказать содействие в строительстве отдельного и более просторного православного храма. Великий князь откликнулся на эту просьбу. Под его председательством было создано Православное Братство, в которое вошли представители русской знати и члены императорской семьи. Некоторые участники комитета, помимо уже сделанных пожертвований на строительство, обязались в течение десяти лет ежегодно вносить по 250 франков на содержание будущего храма.

Особую роль в осуществлении замысла сыграла Александра Скрипицына-Трипе. На имя строительного комитета она передала участок земли площадью около двух гектаров, располагавшийся в одном из лучших районов Канн, на возвышенной части города, на бульваре Нотр-Дам де Пэн. Впоследствии участок был расширен за счёт приобретения дополнительных земель. Сбор средств шёл необычайно быстро. Русская община Канн, объединившая вокруг строительства представителей императорского дома, дворянства и многочисленных благотворителей, всего за два месяца собрала 60 тысяч франков. Жертвовали не только деньги, но и церковную утварь, иконы, украшения для будущего храма. Так строительство каннской церкви стало общим делом русской православной колонии на Лазурном Берегу.

Строительство и архитектура

Проект храма был поручен французскому архитектору Луи Нуво. Он создал здание в духе традиционного московского православного зодчества XVII века. Церковь была задумана как однопрестольная. Бесстолпный храм завершался выносным зубчатым карнизом и увенчивался голубой главкой на небольшом световом барабане. Узорчатая марсельская черепица покрывала крышу, а стены были облицованы каменными плитами. Узкие полуциркульные окна с «византийскими» наличниками пропускали в храм мягкий свет через витражи, наполняя интерьер сиянием и защищая его от яркого южного солнца. Внутреннее пространство было украшено широким лепным карнизом и постепенно украшалось иконами, лампадами и другими дарами благотворителей.

Закладка храма, рассчитанного примерно на 400 человек, была совершена 5 мая 1894 года — в день памяти великомученика Георгия Победоносца — по благословению митрополита Санкт-Петербургского и Ладожского Палладия. Освящение состоялось уже 4 декабря того же года. После освящения муниципалитет Канн принял решение переименовать улицу, на которой была построена церковь, в бульвар Александра III. Так русский православный храм стал важной частью не только духовной, но и городской истории Канн.

Церковь получила значительные пожертвования от членов императорской фамилии и русских благотворителей. Великий князь Михаил Михайлович передал священные сосуды, напрестольный крест, Евангелие и серебряное кадило. Великий князь Сергей Михайлович пожертвовал металлическую церковную ограду. Князь С. М. Голицын подарил ажурный крест для главы храма и две старинные иконы — Спасителя и Божией Матери. В 1896 году почётный гражданин Канн И. И. Елагин на собственные средства построил рядом с церковью одноярусную колокольню высотой 24 метра с семью колоколами. Позднее под храмом была создана крипта-некрополь, а в ней и нижний храм во имя святого благоверного князя Александра Невского и святой великомученицы Екатерины.

Иконописное наследие

Многие иконы, находящиеся в храме, относятся ко времени его основания. Часть из них была написана русскими мастерами-эмигрантами, жившими в Каннах. При храме долгое время действовала иконописная мастерская под руководством Валентина Александровича Цевчинского (1906–1992). Богатое внутреннее убранство храма создавалось почти исключительно благодаря щедрости русской общины. Супруги Чихачёвы, например, подарили серебряные позолоченные лампады, позолоченную купель, плащаницу, а также оплатили устройство мраморного иконостаса с иконами.

Храм и русская эмиграция

Со временем храм Архангела Михаила стал не только приходской церковью, но и своеобразным памятником русскому присутствию на юге Франции. В некрополе под храмом были погребены великий князь Николай Николаевич Младший, главнокомандующий русской армией в годы Первой мировой войны, его брат великий князь Пётр Николаевич, а также их супруги — великие княгини Анастасия и Милица Николаевны. В апреле 2015 года прах великого князя Николая Николаевича и великой княгини Анастасии был перенесён в Москву и перезахоронен в часовне Преображения Господня Мемориально-паркового комплекса героев Первой мировой войны.

В крипте были погребены архиепископ Григорий (Остроумов), князь Пётр Ольденбургский, скончавшийся в 1924 году, а также героиня французского Сопротивления гречанка Элен Ваглиано, расстрелянная немцами в Каннах в 1944 году.

В годы Первой мировой войны приход заботился о раненых русских офицерах и солдатах Экспедиционного корпуса во Франции. После революции 1917 года Канны стали одним из мест, где нашли убежище представители русской эмиграции. В стенах Михаило-Архангельского храма совершались венчания, крещения и отпевания членов императорской семьи, русских аристократов и простых изгнанников. В 1921 году здесь состоялось венчание великого князя Андрея Владимировича с балериной Матильдой Кшесинской, которая впоследствии приняла православие в этом же храме.

В межвоенный период русская колония в Каннах была многочисленной, как никогда прежде. Приход участвовал в жизни молодёжи, содействовал организации лагерей «Национальной организации витязей» на территории каннского гольф-клуба, оставаясь центром духовного, культурного и общественного общения для нескольких поколений русских людей, оказавшихся вдали от Родины.

Послевоенное возрождение

После Второй мировой войны община пережила новый период оживления, особенно во время настоятельства священника Игоря Дулгова (впоследствии — архиепископ Серафим). Он уделял большое внимание молодёжи, окормлял Русский дом для престарелых в Каннах, заботился о духовном просвещении прихожан и издавал приходской листок. Забота общины простиралась и за пределы храмовой ограды: на каннском некрополе Абади была воздвигнута Успенская часовня-костница для сохранения останков православных христиан. До 1998 года, согласно поминальным спискам, в часовню были перенесены останки 345 человек.

Испытания и путь к восстановлению

К своему столетию в 1994 году храм был отреставрирован при участии властей города Канн и департамента. Однако со временем здание вновь столкнулось с серьёзными испытаниями. Поднявшиеся грунтовые воды начали размывать фундамент, крыша стала протекать во время сильных дождей, пострадало внутреннее убранство, а крипте стала угрожать опасность затопления. В 2011 году стало ясно, что храм нуждается в срочном ремонте. Летом 2015 года церковь была закрыта из-за угрозы падения купола колокольни, и уже в сентябре того же года купол обрушился на здание правого притвора.

Некоторое время литургическая жизнь при каннском храме теплилась в приспособленной постройке. После сноса временной часовни по требованию мэрии Канн, по благословению Патриаршего экзарха Западной Европы митрополита Корсунского и Западноевропейского Марка, богослужебная жизнь при Михаило-Архангельском храме была возобновлена в день Лазаревой субботы и праздник Пасхи 2026 года. Отныне, в период работ по восстановлению, богослужения совершаются по субботам.

Сегодня, обращаясь к богатому прошлому храма, мы видим не только вереницу славных имён, дат и событий. Перед нами раскрывается история непоколебимых веры и преданности — преданности православной традиции, Отечеству, памяти предков, молитве и надежде. Именно эти преданность и вера некогда вдохновили первых жертвователей и строителей храма. Именно они и теперь могут стать добрым импульсом в восстановлении и сохранении этого святого места для будущих поколений.','published',10),
('home','ru','hero','Община при Михаило-Архангельском храме в Каннах','','','published',1),
('home','ru','body','Община при Михаило-Архангельском храме в Каннах','','','published',10),
('meeting','en','hero','Meeting','','','published',1),
('meeting','en','body','Meeting','For a spiritual or parish matter, you can arrange a meeting with the priest.','Meeting

For a spiritual or parish matter, you can arrange a meeting with the priest.','published',10),
('meeting','fr','hero','Entretien','','','published',1),
('meeting','fr','body','Entretien','Pour une question spirituelle ou pastorale, il est possible de demander un entretien.','Entretien

Pour une question spirituelle ou pastorale, il est possible de demander un entretien.','published',10),
('meeting','ru','hero','Беседа','','','published',1),
('meeting','ru','body','Беседа','Для духовного вопроса, подготовки к таинству или приходского дела можно заранее договориться о встрече.','Беседа

Для духовного вопроса, подготовки к таинству или приходского дела можно заранее договориться о встрече.','published',10),
('news','en','hero','Parish life','','','published',1),
('news','en','body','Parish life','News, announcements and parish materials are managed from the admin panel.','Services

Service schedules and announcements.

Parish life

Meetings, talks and community events.

History

Materials about the church and its restoration.','published',10),
('news','fr','hero','Vie paroissiale','','','published',1),
('news','fr','body','Vie paroissiale','Les nouvelles, annonces et documents paroissiaux sont g?r?s depuis l?administration.','Offices

Horaires et annonces des offices.

Vie paroissiale

Rencontres, entretiens et ?v?nements.

Histoire

Documents sur l??glise et sa restauration.','published',10),
('news','ru','hero','Жизнь прихода','','','published',1),
('news','ru','body','Жизнь прихода','Новости, объявления и приходские материалы обновляются через админку.','Богослужения

Расписание и объявления о службах.

Приходская жизнь

Встречи, беседы и события общины.

История

Материалы о храме и его восстановлении.','published',10),
('notes','en','hero','Prayer Notes','','','published',1),
('notes','en','body','Prayer Notes','Names for the living and departed are submitted before the service.','Prayer Notes

Names for the living and departed are submitted before the service.','published',10),
('notes','fr','hero','Intentions','','','published',1),
('notes','fr','body','Intentions','Les intentions pour les vivants et les défunts sont remises avant l''office.','Intentions

Les intentions pour les vivants et les défunts sont remises avant l''office.','published',10),
('notes','ru','hero','Записки','','','published',1),
('notes','ru','body','Записки','О здравии и об упокоении имена подаются до начала богослужения.','Записки

О здравии и об упокоении имена подаются до начала богослужения.','published',10),
('sacraments','en','hero','Sacraments','','','published',1),
('sacraments','en','body','Sacraments','A clear path for preparation and contacting the parish.','Baptism

A clear path for preparation and contacting the parish.

Wedding

A clear path for preparation and contacting the parish.

Confession

A clear path for preparation and contacting the parish.

Communion

A clear path for preparation and contacting the parish.

Prayer Notes

A clear path for preparation and contacting the parish.

Meeting

A clear path for preparation and contacting the parish.','published',10),
('sacraments','fr','hero','Sacrements','','','published',1),
('sacraments','fr','body','Sacrements','Un chemin clair pour se préparer et contacter la paroisse.','Baptême

Un chemin clair pour se préparer et contacter la paroisse.

Mariage

Un chemin clair pour se préparer et contacter la paroisse.

Confession

Un chemin clair pour se préparer et contacter la paroisse.

Communion

Un chemin clair pour se préparer et contacter la paroisse.

Intentions

Un chemin clair pour se préparer et contacter la paroisse.

Entretien

Un chemin clair pour se préparer et contacter la paroisse.','published',10),
('sacraments','ru','hero','Таинства и требы','','','published',1),
('sacraments','ru','body','Таинства и требы','Раздел помогает подготовиться к церковным Таинствам и связаться с приходом для личной договоренности.','Крещение

Подготовка ребенка или взрослого к вступлению в Церковь.

Венчание

Согласование даты, беседа со священником и церковная подготовка.

Исповедь

Покаяние, примирение с Богом и подготовка к Причастию.

Причастие

Участие в Евхаристии как центр церковной жизни.

Записки

Имена о здравии и об упокоении для молитвенного поминовения.

Беседа

Личная встреча со священником по вопросам веры и жизни.','published',10),
('schedule','en','hero','Service schedule','','','published',1),
('schedule','en','body','Service schedule','Parish service sheet following the printed style of the church.','St Michael
the Archangel
Church
in Cannes

Service schedule

13 June - Apostle Hermas of the Seventy;
27 June - Prophet Elisha;
4 July - Saint Maximus the Greek;
11 July - Saints Sergius and Herman of Valaam;
18 July - Saint Sergius of Radonezh, Saint Elizabeth and Nun Barbara.
Services begin at 10:00
During restoration works, services are celebrated on Saturdays in the garden of the church.

+33684657185','published',10),
('schedule','fr','hero','Horaires des offices','','','published',1),
('schedule','fr','body','Horaires des offices','Feuille paroissiale des offices selon le modèle imprimé de l''église.','Église
Saint-Michel
Archange
à Cannes

Horaires des offices

13 June - Apostle Hermas of the Seventy;
27 June - Prophet Elisha;
4 July - Saint Maximus the Greek;
11 July - Saints Sergius and Herman of Valaam;
18 July - Saint Sergius of Radonezh, Saint Elizabeth and Nun Barbara.
Début des offices à 10h00
Pendant les travaux de restauration, les offices sont célébrés le samedi dans le jardin de l''église.

+33684657185','published',10),
('schedule','ru','hero','Расписание богослужений','','','published',1),
('schedule','ru','body','Расписание богослужений','Актуальное расписание можно обновлять через админку: текстом и отдельным PDF-файлом.','Храм
Архангела
Михаила
в Каннах

Расписание богослужений

Богослужения совершаются по благословению Патриаршего экзарха Западной Европы.
В период реставрационных работ богослужения проходят по субботам на территории храма.
Начало богослужений - 10:00

За дополнительной информацией: +33 6 84 65 71 85','published',10),
('visit','en','hero','Visit','','','published',1),
('visit','en','body','Visit','Address, visitor guidance and directions for parishioners, pilgrims and guests.','Visit

40 boulevard Alexandre III, 06400 Cannes.

Services

Saturday, 10:00

Contacts

Contacts','published',10),
('visit','fr','hero','Visiter','','','published',1),
('visit','fr','body','Visiter','Adresse, règles de visite et itinéraire pour les fidèles, pèlerins et visiteurs.','Visiter

40 boulevard Alexandre III, 06400 Cannes.

Offices

Samedi, 10h00

Contacts

Contacts','published',10),
('visit','ru','hero','Посетителям','','','published',1),
('visit','ru','body','Посетителям','Адрес, правила посещения и маршрут для прихожан, паломников и гостей города.','Посетителям

40 boulevard Alexandre III, 06400 Cannes.

Богослужения

Суббота, 10:00

Контакты

Контакты','published',10),
('wedding','en','hero','Wedding','','','published',1),
('wedding','en','body','Wedding','The wedding date is agreed after a meeting with the priest.','Wedding

The wedding date is agreed after a meeting with the priest.','published',10),
('wedding','fr','hero','Mariage','','','published',1),
('wedding','fr','body','Mariage','La date du mariage religieux est fixée après un entretien avec le prêtre.','Mariage

La date du mariage religieux est fixée après un entretien avec le prêtre.','published',10),
('wedding','ru','hero','Венчание','','','published',1),
('wedding','ru','body','Венчание','Дата венчания согласуется после беседы со священником и проверки церковных условий.','Венчание

Дата венчания согласуется после беседы со священником и проверки церковных условий.','published',10);

delete from public.media_files
where page_key = 'history'
  and purpose = 'history_gallery';

insert into public.media_files
  (page_key, purpose, title, file_url, mime_type, status, sort_order)
values
('history','history_gallery','Wikimedia Commons','https://commons.wikimedia.org/wiki/Special:FilePath/Church%20in%20Cannes.jpg','image/jpeg','published',1),
('history','history_gallery','Wikimedia Commons','https://commons.wikimedia.org/wiki/Special:FilePath/Interior%20of%20Orthodox%20Church%20in%20Cannes.jpg','image/jpeg','published',2),
('history','history_gallery','Wikimedia Commons','https://commons.wikimedia.org/wiki/Special:FilePath/Bells%20in%20Cannes.jpg','image/jpeg','published',3),
('history','history_gallery','Wikimedia Commons','https://commons.wikimedia.org/wiki/Special:FilePath/Easter%20Cross%20Procession.jpg','image/jpeg','published',4),
('history','history_gallery','Wikimedia Commons','https://commons.wikimedia.org/wiki/Special:FilePath/%D0%9C%D0%B8%D1%85%D0%B0%D0%B9%D0%BB%D0%BE-%D0%90%D1%80%D1%85%D0%B0%D0%BD%D0%B3%D0%B5%D0%BB%D1%8C%D1%81%D0%BA%D0%B8%D0%B9%20%D1%85%D1%80%D0%B0%D0%BC%20%D0%BD%D0%BE%D1%87%D1%8C%D1%8E.jpg','image/jpeg','published',5),
('history','history_gallery','Wikimedia Commons','https://commons.wikimedia.org/wiki/Special:FilePath/Eglise%20orthodoxe%20Cannes.JPG','image/jpeg','published',6),
('history','history_gallery','Wikimedia Commons','https://commons.wikimedia.org/wiki/Special:FilePath/StMichelCannes.JPG','image/jpeg','published',7);
