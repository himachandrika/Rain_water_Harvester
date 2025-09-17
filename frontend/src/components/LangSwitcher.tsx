import { useTranslation } from 'react-i18next';

export default function LangSwitcher() {
	const { i18n, t } = useTranslation();
	return (
		<label>
			{t('language')}{' '}
			<select className="border p-1" value={i18n.language} onChange={(e)=>i18n.changeLanguage(e.target.value)}>
				<option value="en">English</option>
				<option value="hi">हिन्दी</option>
			</select>
		</label>
	);
}
