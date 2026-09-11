/**
 * scopulusUI 의 공개 API. **여기 없는 것은 공개된 것이 아니다.**
 *
 * 이유: 배럴이 없으면 부르는 쪽이 내부 경로를 직접 집게 되고, 그 순간 파일을 옮기는 것이
 * 파괴적 변경이 된다. 무엇을 꺼낼지 여기서만 정한다.
 *
 * 순서는 두 묶음이다 — **handwork 실측에서 나온 것**과 **shadcn base-nova 에서 받은 것**.
 * 둘의 근거가 다르므로 스펙에서도 섞지 않는다. 각 스펙의 `## 근거` 절을 보라.
 */

// ── handwork 화면에서 실측해 뽑은 것 (9종) ─────────────────────────────────
export { AppLink } from "./ui/app-link";
export { Badge } from "./ui/badge";
export { Button } from "./ui/button";
export { Card } from "./ui/card";
export { PageShell } from "./ui/page-shell";
export { PageTitle } from "./ui/page-title";
export { Prose, PROSE } from "./ui/prose";
export { Separator } from "./ui/separator";
export { ThemeToggle } from "./ui/theme-toggle";

// ── shadcn base-nova 에서 받은 것 (11종) ───────────────────────────────────
export { Alert, AlertAction, AlertDescription, AlertTitle } from "./ui/alert";
export { Checkbox } from "./ui/checkbox";
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
export { Input } from "./ui/input";
export {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./ui/popover";
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
export { Skeleton } from "./ui/skeleton";
export { Switch } from "./ui/switch";
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
export { Textarea } from "./ui/textarea";
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
