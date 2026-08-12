# 3D 모델 에셋 넣는 법 (CC0 입문)

이 폴더에 3D 파일을 넣으면 앱이 자동으로 사용합니다.

| 파일 이름 | 쓰이는 곳 | 없을 때 대체 |
|---|---|---|
| `human.glb` | 진입 화면(전신 인체) | 2D 바디맵 |
| `brain.glb` | 뇌 장기 탐색 화면 | 절차적(코드) 뇌 |

`human.glb`는 그냥 넣기만 하면 됩니다. 코드는 이미 `/models/human.glb`를
읽도록 되어 있고, **파일이 없으면 자동으로 2D 바디맵으로 대체**되므로
앱이 깨지지 않습니다. `brain.glb`는 `src/components/scene/BrainModel.tsx`의
`BRAIN_GLB_URL`을 `"/models/brain.glb"`로 바꿔야 켜집니다.

---

## CC0가 뭐예요?

만든 사람이 **저작권을 완전히 포기**한 상태예요. 출처 표기도, 허락도 필요 없이
개인·상업 어디든 자유롭게 쓸 수 있습니다. "완전 무료 3D 완제품 파일"이라고
생각하면 됩니다. (참고: `CC-BY`는 무료지만 만든 사람 이름을 표기해야 함)

## 무료 인체 모델 구하는 곳 (초보자 추천 순서)

1. **Poly Pizza** — https://poly.pizza
   - 계정 없이 바로 다운로드, 대부분 CC0/CC-BY. "human", "person"으로 검색.
   - 다운로드 시 **GLB** 형식 선택 → 그대로 이 폴더에 넣으면 끝.

2. **Quaternius** — https://quaternius.com
   - 전부 CC0인 캐릭터 팩(사람 포함). 압축 풀면 glTF/GLB가 들어 있어요.

3. **Sketchfab** — https://sketchfab.com
   - 가장 사실적. 검색 후 왼쪽 필터에서 **Downloadable + License: CC0** 체크.
   - 무료 계정으로 로그인 → Download → **glTF (.glb)** 선택.

4. **Ready Player Me** — https://readyplayer.me (선택)
   - 내 아바타를 만들어 `.glb`로 받을 수 있어요(사람 형태, 무료).

## 실제 순서 (5분)

1. 위 사이트에서 인체 모델을 찾는다.
2. **`.glb` 형식으로 다운로드**한다. (`.gltf`+`.bin`+텍스처 여러 개면 아래 변환 참고)
3. 파일 이름을 `human.glb`로 바꾼다.
4. 이 폴더(`public/models/`)에 넣는다.
5. 브라우저 새로고침 → 진입 화면에 3D 사람이 뜬다. (크기·중심은 자동 보정됨)

## 파일이 .glb가 아닐 때 (변환)

- `.obj` / `.fbx` / `.stl` / `.gltf(여러 파일)` → **Blender**에서 열고
  `File ▸ Export ▸ glTF 2.0 (.glb)` 로 내보내면 한 파일로 합쳐집니다.
- 용량이 크면(수십 MB↑): 터미널에서
  `npx @gltf-transform/cli optimize human.glb human.glb` 로 압축 권장.

## 안 보이거나 이상할 때

- **아무것도 안 뜸**: 파일 이름이 정확히 `human.glb`인지, 이 폴더에 있는지 확인.
- **너무 크거나 작음**: 자동 정규화되지만, 어색하면
  `src/components/scene/HumanScene.tsx`의 `TARGET_HEIGHT` 값을 조절.
- **누워 있거나 뒤돌아 있음**: 모델 자체의 방향 문제. Blender에서 회전 후
  다시 내보내거나, `HumanModelFit`에서 `clone.rotation.x/y`를 조정.
