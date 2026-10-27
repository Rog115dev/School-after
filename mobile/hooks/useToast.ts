import { useCallback, useState } from "react";

export function useToast() {
  const [message, setMessage] = useState("");
  const show = useCallback((text: string) => setMessage(text), []);
  const hide = useCallback(() => setMessage(""), []);
  return { message, visible: !!message, show, hide };
}
