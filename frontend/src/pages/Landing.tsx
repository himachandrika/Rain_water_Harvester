export default function Landing({ onStart }: { onStart: () => void }) {
	return (
		<div className="min-h-screen grid place-items-center bg-gradient-to-b from-blue-50 to-white dark:from-neutral-900 dark:to-neutral-900">
			<div className="max-w-2xl mx-auto text-center p-6">
				<h1 className="text-3xl font-bold mb-3">RTRWH & Artificial Recharge Assessment</h1>
				<p className="text-gray-600 dark:text-neutral-300 mb-6">Estimate rainwater harvesting potential and recommended recharge structures for your location using map selection and simple inputs.</p>
				<button className="bg-blue-600 text-white px-5 py-2 rounded shadow" onClick={onStart}>Get Started</button>
			</div>
		</div>
	);
}
