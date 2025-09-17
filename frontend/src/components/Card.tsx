type Props = {
	title?: string;
	actions?: React.ReactNode;
	children?: React.ReactNode;
	className?: string;
};

export default function Card({ title, actions, children, className }: Props) {
	return (
		<div className={`rounded-lg border shadow-sm bg-white dark:bg-neutral-900 dark:border-neutral-800 ${className ?? ''}`}>
			{(title || actions) && (
				<div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50 dark:bg-neutral-800 dark:border-neutral-800">
					{title && <h3 className="font-medium text-gray-800 dark:text-neutral-100">{title}</h3>}
					{actions}
				</div>
			)}
			<div className="p-4">{children}</div>
		</div>
	);
}
