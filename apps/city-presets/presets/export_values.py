"""`PRESETS` 를 브라우저가 읽을 TypeScript 로 내보낸다.

손으로 옮겨 적지 않는다. 같은 숫자가 두 벌 있으면 한쪽만 고쳐진다.
"""
import json, pathlib, shutil, subprocess
from grade import PRESETS, SLIDERS

OUT = pathlib.Path('../src/shared/preset-values.ts')

def main():
    items = []
    for name, p in PRESETS.items():
        fields = [f'    {k}: {v},' for k in SLIDERS if (v := p.get(k))]
        if ss := p.get('split_shadow'):
            fields.append(f'    splitShadow: [{ss[0]}, {ss[1]}],')
        if sh := p.get('split_high'):
            fields.append(f'    splitHigh: [{sh[0]}, {sh[1]}],')
        if hs := p.get('hue_sat'):
            fields.append('    hueSat: ' + json.dumps(hs).replace('], [', '], [') + ',')
        items.append(f'  "{name}": {{\n' + '\n'.join(fields) + '\n  },')

    OUT.write_text(
        '// 이 파일은 `presets/export_values.py` 가 만든다. 손으로 고치지 마라.\n'
        '// 값의 정본은 `presets/grade.py` 의 `PRESETS` 다.\n\n'
        'export type PresetParams = {\n'
        + ''.join(f'  {k}?: number;\n' for k in SLIDERS) +
        '  splitShadow?: [number, number];\n'
        '  splitHigh?: [number, number];\n'
        '  hueSat?: [number, number, number][];\n'
        '};\n\n'
        'export const PRESET_VALUES: Record<string, PresetParams> = {\n'
        + '\n'.join(items) + '\n};\n',
        encoding='utf-8')
    # 포맷은 저장소 규칙을 따른다. 그러지 않으면 이 스크립트를 돌릴 때마다
    # `pnpm format:check` 가 깨진다.
    if npx := shutil.which('npx'):
        # 앱 루트에서 돌려야 프로젝트의 prettier 설정을 찾는다
        subprocess.run([npx, 'prettier', '--write', OUT.name],
                       cwd=OUT.parent, check=False,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.run([npx, 'prettier', '--write', 'src/shared/' + OUT.name],
                       cwd=OUT.parents[2], check=False,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f'{OUT} · {len(PRESETS)}종')

if __name__ == '__main__':
    main()
