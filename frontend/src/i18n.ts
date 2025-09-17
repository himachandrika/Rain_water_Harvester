import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
	en: {
		translation: {
			"title": "RTRWH & AR Assessment (MVP)",
			"latitude": "Latitude",
			"longitude": "Longitude",
			"roof_area": "Roof area (m²)",
			"roof_type": "Roof type",
			"open_space": "Open space (m²)",
			"collection_efficiency": "Collection efficiency",
			"assess": "Assess",
			"download_report": "Download Report",
			"context": "Context",
			"assessment": "Assessment",
			"concrete": "Concrete",
			"tile": "Tile",
			"metal": "Metal",
			"asbestos": "Asbestos",
			"language": "Language"
		}
	},
	hi: {
		translation: {
			"title": "आरटीआरडब्ल्यूएच और एआर आकलन (एमवीपी)",
			"latitude": "अक्षांश",
			"longitude": "देशांतर",
			"roof_area": "छत का क्षेत्रफल (मी²)",
			"roof_type": "छत का प्रकार",
			"open_space": "खुला स्थान (मी²)",
			"collection_efficiency": "संग्रह दक्षता",
			"assess": "आकलन करें",
			"download_report": "रिपोर्ट डाउनलोड करें",
			"context": "प्रसंग",
			"assessment": "आकलन",
			"concrete": "कंक्रीट",
			"tile": "टाइल",
			"metal": "धातु",
			"asbestos": "एस्बेस्टस",
			"language": "भाषा"
		}
	}
};

i18n.use(initReactI18next).init({
	resources,
	lng: 'en',
	fallbackLng: 'en',
	interpolation: { escapeValue: false }
});

export default i18n;
