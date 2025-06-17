import { Button, Card, Center, Title } from "@mantine/core";

export function NotFound() {
	return (
		<Center className={"h-dvh w-dvw"} component={"main"}>
			<Card className={"max-w-md w-full flex flex-col text-center space-y-8"}>
				<div>
					<Title>
						404: Not Found
					</Title>
					<Title order={3} className={"text-lg"}>
						This page does not exist or has been moved
					</Title>
				</div>
				<Button component={"a"} href={"/"}>
					Back to Sign In
				</Button>
			</Card>
		</Center>
	);
}
