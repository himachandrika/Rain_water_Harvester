import puppeteer from 'puppeteer';

export type ReportPayload = {
	inputs: any;
	context: any;
	assessment: any;
};

function renderHtml(payload: ReportPayload): string {
	return `<!doctype html>
	<html>
	<head>
		<meta charset="utf-8" />
		<title>RTRWH & AR Report</title>
		<style>
			body { font-family: Arial, sans-serif; padding: 24px; }
			h1 { font-size: 20px; margin-bottom: 8px; }
			pre { background: #f5f5f5; padding: 8px; }
		</style>
	</head>
	<body>
		<h1>RTRWH & AR Assessment Report</h1>
		<h2>Inputs</h2>
		<pre>${JSON.stringify(payload.inputs, null, 2)}</pre>
		<h2>Context</h2>
		<pre>${JSON.stringify(payload.context, null, 2)}</pre>
		<h2>Assessment</h2>
		<pre>${JSON.stringify(payload.assessment, null, 2)}</pre>
		<p>Generated on ${new Date().toISOString()}</p>
	</body>
	</html>`;
}

export async function generatePdf(payload: ReportPayload): Promise<Uint8Array> {
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.setContent(renderHtml(payload), { waitUntil: 'networkidle0' });
	const pdf = await page.pdf({ format: 'A4', printBackground: true });
	await browser.close();
	return pdf;
}
