import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Toaster, toast } from 'sonner';
import { motion } from 'framer-motion';
// import Map from './components/Map';
import LeafletMap from './components/LeafletMap';
import LangSwitcher from './components/LangSwitcher';
import Card from './components/Card';
import RainChart from './components/RainChart';
import GeolocateButton from './components/GeolocateButton';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

function Stat({ label, value, suffix }: { label: string; value: string | number; suffix?: string }) {
	return (
		<div className="rounded-md border p-3 bg-white dark:bg-neutral-900 dark:border-neutral-800">
			<div className="text-xs text-gray-500 dark:text-neutral-400">{label}</div>
			<div className="text-lg font-semibold">{value}{suffix}</div>
		</div>
	);
}

function prettyLabel(key: string): string {
	return key.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

function SizingCard({ title, spec }: { title: string; spec: Record<string, number> }) {
	return (
		<div className="rounded border p-0 bg-white dark:bg-neutral-900 dark:border-neutral-800 overflow-hidden">
			<div className="px-3 py-2 text-xs uppercase tracking-wide text-gray-600 dark:text-neutral-400 bg-gray-50 dark:bg-neutral-800 border-b dark:border-neutral-800">{title}</div>
			<table className="w-full text-sm">
				<tbody>
					{Object.entries(spec).map(([k, v]) => (
						<tr key={k} className="border-t last:border-b dark:border-neutral-800">
							<td className="px-3 py-2 text-gray-600 dark:text-neutral-400 w-1/2">{prettyLabel(k)}</td>
							<td className="px-3 py-2 font-medium">{v}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export default function App() {
	const { t } = useTranslation();
	const [lat, setLat] = useState(28.6139);
	const [lon, setLon] = useState(77.2090);
	const [roofArea, setRoofArea] = useState(120);
	const [roofType, setRoofType] = useState<'concrete'|'tile'|'metal'|'asbestos'>('concrete');
	const [openSpace, setOpenSpace] = useState(20);
	const [eff, setEff] = useState(0.9);
	const [dark, setDark] = useState(false);

	useEffect(() => {
		document.documentElement.classList.toggle('dark', dark);
	}, [dark]);

	const ctxQuery = useQuery({
		queryKey: ['context', lat, lon],
		queryFn: async () => {
			const res = await fetch(`${API_BASE}/context?lat=${lat}&lon=${lon}`);
			if (!res.ok) throw new Error('Failed to load context');
			return res.json();
		}
	});

	const assessMutation = useMutation({
		mutationFn: async () => {
			const res = await fetch(`${API_BASE}/assess`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					location: { lat, lon },
					roof_area_m2: roofArea,
					roof_type: roofType,
					open_space_m2: openSpace,
					occupiers: 4,
					collection_efficiency: eff
				})
			});
			if (!res.ok) throw new Error('Assessment failed');
			return res.json();
		},
		onError: (err: any) => toast.error(err?.message || 'Something went wrong')
	});

	useEffect(() => {
		if (ctxQuery.data && !assessMutation.isPending) {
			assessMutation.mutate();
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ctxQuery.data]);

	async function downloadReport() {
		try {
			const res = await fetch(`${API_BASE}/report`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ inputs: { lat, lon, roofArea, roofType, openSpace, eff }, context: ctxQuery.data, assessment: assessMutation.data })
			});
			if (!res.ok) throw new Error('Report failed');
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url; a.download = 'rtrwh_report.pdf'; a.click();
			URL.revokeObjectURL(url);
			toast.success('Report downloaded');
		} catch (e: any) {
			toast.error(e?.message || 'Report failed');
		}
	}

	const sizing = assessMutation.data?.sizing as Record<string, Record<string, number>> | undefined;

	return (
		<div className={`min-h-screen ${dark ? 'bg-neutral-900 text-neutral-100' : 'bg-gray-100 text-gray-900'}`}>
			<Toaster richColors position="top-center" />
			<header className={`sticky top-0 z-10 backdrop-blur ${dark ? 'bg-neutral-900/70 border-neutral-800' : 'bg-white/80 border-b'} border-b`}>
				<div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
					<h1 className="text-lg md:text-xl font-semibold">{t('title')}</h1>
					<div className="flex items-center gap-3">
						<label className="text-sm flex items-center gap-2"><input type="checkbox" checked={dark} onChange={e=>setDark(e.target.checked)} /> Dark</label>
						<LangSwitcher />
					</div>
				</div>
			</header>
			<main className="max-w-6xl mx-auto px-4 py-4 grid gap-4 md:grid-cols-2">
				<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
					<Card title="Location & Inputs" actions={<GeolocateButton onLocate={(la,lo)=>{ setLat(la); setLon(lo); }} />}>
						<LeafletMap lat={lat} lon={lon} onChange={(la, lo)=>{ setLat(la); setLon(lo); }} height="320px" />
						<div className="grid grid-cols-2 gap-3 mt-3">
							<label className="text-sm">{t('latitude')}<input className="mt-1 w-full border rounded p-2" aria-label={t('latitude')} type="number" value={lat} onChange={e=>setLat(parseFloat(e.target.value))} /></label>
							<label className="text-sm">{t('longitude')}<input className="mt-1 w-full border rounded p-2" aria-label={t('longitude')} type="number" value={lon} onChange={e=>setLon(parseFloat(e.target.value))} /></label>
							<label className="text-sm col-span-2">{t('roof_area')}<input className="mt-1 w-full border rounded p-2" aria-label={t('roof_area')} type="number" value={roofArea} onChange={e=>setRoofArea(parseFloat(e.target.value))} /></label>
							<label className="text-sm">{t('roof_type')}
								<select className="mt-1 w-full border rounded p-2" aria-label={t('roof_type')} value={roofType} onChange={e=>setRoofType(e.target.value as any)}>
									<option value="concrete">{t('concrete')}</option>
									<option value="tile">{t('tile')}</option>
									<option value="metal">{t('metal')}</option>
									<option value="asbestos">{t('asbestos')}</option>
								</select>
							</label>
							<label className="text-sm">{t('open_space')}<input className="mt-1 w-full border rounded p-2" aria-label={t('open_space')} type="number" value={openSpace} onChange={e=>setOpenSpace(parseFloat(e.target.value))} /></label>
							<label className="text-sm col-span-2">{t('collection_efficiency')}<input className="mt-1 w-full border rounded p-2" aria-label={t('collection_efficiency')} type="number" step="0.05" min="0" max="1" value={eff} onChange={e=>setEff(parseFloat(e.target.value))} /></label>
						</div>
					</Card>
				</motion.div>

				<div className="space-y-4">
					<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
						<Card title={t('context')}>
							{ctxQuery.isLoading ? <div className="animate-pulse h-40 bg-gray-200 dark:bg-neutral-800 rounded" /> :
							ctxQuery.isError ? <div className="text-red-600">Failed to load context</div> : (
								<>
									{Array.isArray(ctxQuery.data?.monthly_rainfall_mm) && (
										<div className="mb-3">
											<RainChart 
												months={ctxQuery.data.monthly_rainfall_mm} 
												dataPeriod={ctxQuery.data.rainfall_data_period}
												yearsCount={ctxQuery.data.rainfall_years_count}
											/>
										</div>
									)}
									<div className="grid grid-cols-2 gap-3 mb-3">
										<Stat label="Annual Rainfall" value={ctxQuery.data.rainfall_mm_year} suffix=" mm" />
										<Stat label="Groundwater Depth" value={ctxQuery.data.groundwater_depth_m} suffix=" m" />
									</div>
									<div className="text-sm">Aquifer: <span className="font-medium">{ctxQuery.data.aquifer?.name}</span> ({ctxQuery.data.aquifer?.type})</div>
								</>
							)}
						</Card>
					</motion.div>
					<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
						<Card title={t('assessment')} actions={<button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={()=>assessMutation.mutate()} disabled={assessMutation.isPending}>{t('assess')}</button>}>
							{assessMutation.isPending ? <div className="animate-pulse h-40 bg-gray-200 dark:bg-neutral-800 rounded" /> : (
								<div className="space-y-3 text-sm">
									<div className="flex items-center gap-2">Feasibility: <span className={`px-2 py-0.5 rounded text-white ${assessMutation.data?.feasibility === 'Yes' ? 'bg-green-600' : 'bg-yellow-600'}`}>{assessMutation.data?.feasibility}</span></div>
									<div>Annual Harvest: <span className="font-semibold">{assessMutation.data?.volumes?.annual_harvest_m3} m³</span></div>
									<div>Cost Estimate: <span className="font-semibold">₹ {assessMutation.data?.cost_estimate_inr?.toLocaleString?.()}</span></div>
									{Boolean(sizing) && (
										<div className="grid md:grid-cols-2 gap-3">
											{Object.entries(sizing!).map(([k, v]) => v ? (
												<SizingCard key={k} title={prettyLabel(k)} spec={v as Record<string, number>} />
											) : null)}
										</div>
									)}
									<div className="mt-2">
										<button className="bg-green-600 text-white px-3 py-1 rounded" onClick={downloadReport} disabled={!assessMutation.data}>{t('download_report')}</button>
									</div>
								</div>
							)}
						</Card>
					</motion.div>
				</div>
			</main>
			<footer className="text-center text-xs opacity-70 py-6">© {new Date().getFullYear()} RTRWH App</footer>
		</div>
	);
}
