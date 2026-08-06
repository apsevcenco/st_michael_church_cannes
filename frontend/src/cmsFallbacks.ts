import type { ContentSection, LanguageCode } from "./types";

type FallbackSection = Pick<ContentSection, "section_key" | "title" | "summary" | "body" | "sort_order">;

const ruFallbacks: Record<string, FallbackSection[]> = {
  history: [
    {
      section_key: "body",
      title: "",
      summary: "",
      body:
        "История храма Архангела Михаила в Каннах связана с жизнью русской общины на Лазурном Берегу. В конце XIX века Канны стали одним из мест, где русские семьи, дипломаты, благотворители и представители культурной среды проводили зимние месяцы и нуждались в постоянном православном храме.\n\nХрам был построен в 1894 году и освящён во имя Архистратига Божия Михаила. Он стал духовным центром русской колонии Канн: здесь совершались богослужения, хранилась память о поколениях прихожан, создавалась среда церковной, культурной и благотворительной жизни.\n\nАрхитектура храма, его иконы, внутреннее убранство и историческая память отражают путь православной общины во Франции. В разные периоды храм переживал расцвет, трудные годы, необходимость реставрации и восстановления приходской жизни.\n\nСегодня община сохраняет связь с этой историей и стремится бережно продолжать молитвенную жизнь при Михаило-Архангельском храме. Материалы раздела могут пополняться через админку: текст, фотографии, архивные документы и свидетельства прихожан.",
      sort_order: 10
    }
  ],
  schedule: [
    {
      section_key: "body",
      title: "",
      summary: "",
      body:
        "Расписание богослужений уточняется приходом и может меняться в связи с церковным календарём, реставрационными работами и пастырскими обстоятельствами.\n\nОбычно богослужения совершаются по субботам и воскресным дням. Актуальное расписание, а также объявления о праздничных службах, исповеди и причащении можно разместить здесь через админку текстом или загрузить файлом PDF/JPEG/PNG, чтобы оно сразу отображалось на странице.",
      sort_order: 10
    }
  ],
  gallery: [
    {
      section_key: "body",
      title: "",
      summary: "",
      body:
        "В галерее размещаются фотографии храма, богослужебной жизни, приходских событий, реставрационных работ и архивные изображения. Фотографии добавляются и удаляются через админку.",
      sort_order: 10
    }
  ],
  visit: [
    {
      section_key: "body",
      title: "",
      summary: "",
      body:
        "Храм Архангела Михаила находится в Каннах по адресу: 40 boulevard Alexandre III, entrée 1 impasse des 2 Églises, 06400 Cannes.\n\nПеред посещением рекомендуется уточнить актуальное расписание богослужений и доступность храма, особенно в период реставрационных работ. Для вопросов о богослужениях, требах и встрече со священником используйте раздел Контакты.",
      sort_order: 10
    }
  ],
  contacts: [
    {
      section_key: "body",
      title: "",
      summary: "",
      body:
        "Адрес: 40 boulevard Alexandre III, entrée 1 impasse des 2 Églises, 06400 Cannes.\n\nПо вопросам богослужений, треб, записок, посещения храма и встречи со священником обращайтесь к приходу. Актуальные телефоны, электронную почту и часы приёма можно обновлять через админку.",
      sort_order: 10
    }
  ],
  help: [
    {
      section_key: "donation",
      title: "Банковские реквизиты",
      summary: "",
      body:
        "Здесь будут размещены актуальные банковские реквизиты прихода. Их можно внести и обновлять через админку в разделе Помочь храму.",
      sort_order: 20
    },
    {
      section_key: "details",
      title: "Онлайн-пожертвование",
      summary: "",
      body:
        "Онлайн-пожертвование будет подключено позже. Сейчас кнопку можно оставить неактивной до подключения PayPal или другого платёжного сервиса.",
      sort_order: 30
    }
  ],
  baptism: [
    {
      section_key: "body",
      title: "",
      summary: "",
      body:
        "Крещение временно недоступно для записи через сайт. По вопросам подготовки ребёнка или взрослого к Крещению необходимо заранее обратиться к священнику и согласовать беседу, дату и необходимые документы.",
      sort_order: 10
    }
  ],
  wedding: [
    {
      section_key: "body",
      title: "",
      summary: "",
      body:
        "Венчание временно недоступно для записи через сайт. Для подготовки к Таинству Венчания необходимо заранее обратиться к священнику, обсудить церковные условия, документы и дату совершения Таинства.",
      sort_order: 10
    }
  ],
  confession: [
    {
      section_key: "body",
      title: "",
      summary: "",
      body:
        "Исповедь совершается перед Причащением и в другое согласованное со священником время. Тем, кто давно не исповедовался или готовится впервые, рекомендуется заранее попросить о беседе со священником.",
      sort_order: 10
    }
  ],
  communion: [
    {
      section_key: "body",
      title: "",
      summary: "",
      body:
        "К Таинству Причащения православные христиане приступают после молитвенной подготовки, исповеди и благословения священника. Вопросы подготовки лучше заранее уточнить в приходе, особенно если человек причащается впервые или после долгого перерыва.",
      sort_order: 10
    }
  ],
  notes: [
    {
      section_key: "body",
      title: "",
      summary: "",
      body:
        "Записки о здравии и об упокоении можно передавать в приходе перед богослужением. В тексте записки обычно указываются имена крещёных православных христиан в церковной форме.",
      sort_order: 10
    }
  ],
  meeting: [
    {
      section_key: "body",
      title: "",
      summary: "",
      body:
        "Беседу со священником можно согласовать заранее. Такая встреча нужна для подготовки к Таинствам, обсуждения духовных вопросов, семейных обстоятельств или участия в приходской жизни.",
      sort_order: 10
    }
  ]
};

const simpleTranslations: Record<Exclude<LanguageCode, "ru">, Partial<Record<string, FallbackSection[]>>> = {
  fr: {
    contacts: [
      {
        section_key: "body",
        title: "",
        summary: "",
        body:
          "Adresse : 40 boulevard Alexandre III, entrée 1 impasse des 2 Églises, 06400 Cannes.\n\nLes contacts officiels, les horaires d'accueil et les informations pratiques peuvent être mis à jour depuis l'administration.",
        sort_order: 10
      }
    ]
  },
  en: {
    contacts: [
      {
        section_key: "body",
        title: "",
        summary: "",
        body:
          "Address: 40 boulevard Alexandre III, entrance 1 impasse des 2 Églises, 06400 Cannes.\n\nOfficial contacts, office hours and practical information can be updated from the admin panel.",
        sort_order: 10
      }
    ]
  }
};

export function fallbackSections(pageKey: string, language: LanguageCode): ContentSection[] {
  const languageFallbacks = language === "ru" ? ruFallbacks[pageKey] : simpleTranslations[language][pageKey] || ruFallbacks[pageKey];
  return (languageFallbacks || []).map((item, index) => ({
    id: `fallback-${pageKey}-${language}-${item.section_key}-${index}`,
    page_key: pageKey,
    language,
    status: "published",
    ...item
  }));
}

export function mergeFallbackSections(fallbacks: ContentSection[], sections: ContentSection[]): ContentSection[] {
  const cmsKeys = new Set(sections.map((item) => item.section_key));
  return [...fallbacks.filter((item) => !cmsKeys.has(item.section_key)), ...sections].sort((a, b) => a.sort_order - b.sort_order);
}
