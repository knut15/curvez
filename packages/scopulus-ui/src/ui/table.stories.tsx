import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Badge } from "./badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

const ROWS = [
  { name: "토큰 저장소의 경쟁 상태", stack: "Next.js", days: 3 },
  { name: "빌드 캐시가 비워지는 문제", stack: "Turborepo", days: 8 },
  { name: "다크 모드 첫 화면 깜빡임", stack: "next-themes", days: 1 },
];

const meta = {
  title: "shared/Table",
  component: Table,
  decorators: [
    (Story) => (
      <div className="max-w-2xl bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 머리글·본문·캡션이 한 벌이다. `<th>` 에 `scope="col"` 을 준다 — 화면 낭독기가 어느 칸이
 * 어느 열에 속하는지를 거기서 읽는다.
 *
 * 감싸개가 `overflow-x-auto` 라 좁은 화면에서는 표만 가로로 밀린다. 페이지 전체가
 * 가로로 밀리지 않는다.
 */
export const Default: Story = {
  render: (args) => (
    <Table {...args}>
      <TableCaption>최근 사례 3건</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">제목</TableHead>
          <TableHead scope="col">스택</TableHead>
          <TableHead scope="col" className="text-right">
            걸린 날
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((row) => (
          <TableRow key={row.name}>
            <TableCell className="font-medium">{row.name}</TableCell>
            <TableCell>
              <Badge>{row.stack}</Badge>
            </TableCell>
            <TableCell className="text-right">{row.days}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/**
 * 바닥에 합계를 놓는다. `TableFooter` 는 바탕이 `--muted/50` 이라 본문과 구별되고,
 * 마지막 행의 아래 선을 지운다.
 */
export const WithFooter: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">제목</TableHead>
          <TableHead scope="col" className="text-right">
            걸린 날
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((row) => (
          <TableRow key={row.name}>
            <TableCell className="font-medium">{row.name}</TableCell>
            <TableCell className="text-right">{row.days}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>합계</TableCell>
          <TableCell className="text-right">
            {ROWS.reduce((sum, row) => sum + row.days, 0)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};
