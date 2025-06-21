import { useMemo, type FC } from "react";
import { Button, Progress, Spoiler } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { type ContextModalProps } from "@mantine/modals";

interface LoadingModalProps {
  static_message: string;
  message?: string;
  steps: number;
  completed: number;
  closing_text?: string;
  show_closing_text?: boolean;
}

type LoadingModalPropsWithContext = ContextModalProps<LoadingModalProps>;

export const LoadingModal: FC<LoadingModalPropsWithContext> = ({
  innerProps,
}) => {
  const progress = useMemo(
    () => +((innerProps.completed / innerProps.steps) * 100).toFixed(2),
    [innerProps]
  );

  return (
    <div className="flex flex-col gap-y-4">
      <p className="text-sm font-bold text-center">
        {innerProps.static_message}
      </p>
      <div className="flex flex-col gap-y-1">
        <Progress.Root size={"xl"} transitionDuration={200}>
          <Progress.Section value={progress}>
            <Progress.Label>{progress + "%"}</Progress.Label>
          </Progress.Section>
        </Progress.Root>
        <p className="text-xs text-center truncate">
          {innerProps.message ?? "Please wait..."}
        </p>
        {innerProps.show_closing_text && (
          <p className="text-xs text-center">
            {innerProps.closing_text ?? "Click outside to close."}
          </p>
        )}
      </div>
    </div>
  );
};
