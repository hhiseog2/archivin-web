# ARCHIVIN 웹사이트

`archivin-web-handoff-v4` 디자인(인트로 + A-2.1, v4)을 코드로 옮긴 사이트예요. Next.js (App Router) + TypeScript + CSS Modules. UI 라이브러리는 쓰지 않았어요.

## 실행

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 프로덕션 빌드
npm start          # 빌드한 결과 실행
```

`npm run dev` / `npm run build` 전에 `tokens/tokens.json` → `app/tokens.css`(CSS 변수)가 자동으로 다시 만들어져요. 토큰은 `tokens/tokens.json`만 고치세요.

900px 미만은 모바일 디자인, 이상은 데스크톱 디자인이에요.

## 구조

| 경로 | 내용 |
|---|---|
| `app/page.tsx`, `app/_intro` | 인트로. 남색 패널 아래에 shop 첫 화면을 미리 그려 두고, 누르면 비상구 모션 뒤 `/shop` |
| `app/shop` | shop. 상태는 URL 쿼리: `?cat=outer`, `?brand=levis` / `?brand=vans,converse`, `?sort=price-asc`, `?sold=1`, `?q=iggy` |
| `app/product/[id]`, `app/bag` | 상품 상세, 장바구니 (푸터 없음) |
| `app/about`, `lookbook`, `notice`, `reviews`, `search` | 1차 화면 유지. 새 헤더·푸터·토큰만 적용 |
| `app/checkout`, `order/complete`, `signin`, `mypage` | parked 화면 (UI만) |
| `components/Header` | 모바일 Header, 데스크톱 DHeader, 로고, menu 버튼, bag 링크(BagNav) |
| `components/BagDot`, `BagPreview`, `Menu` | bag 동그라미(담을 때 바느질), bag 미리보기, menu(모바일 오버레이 · 데스크톱 서랍) |
| `components/CategoryMenu`, `SortMenu`, `SearchField`, `Popup` | `all ▾`, `sort`, 그 자리 검색창, 창 공통 스타일 |
| `components/ProductCard`, `PhotoCarousel`, `AddToBagButton`, `InfoRow`, `Footer` | 카드(hover 사진·in bag), 사진 넘김+막대, 담기, 정보 4줄, 푸터 |
| `components/ExitDoorIcon` | 인트로 비상구 아이콘. `exit-door.css`는 디자인 파일에서 그대로 옮긴 거라 손으로 고치지 마세요 |
| `lib/shop.ts`, `lib/cart.ts`, `lib/popups.ts` | shop 쿼리·필터 규칙, 장바구니(localStorage), 창 하나만 열기 |
| `data/products.json` | 상품 목업 14개 (v4 핸드오프, hover 사진 포함) |
| `public/logo`, `public/products` | 스티치 로고(헤더용 2배 PNG 포함), 상품 사진 31장 |

## 디자인 없이 제안대로 만든 화면 (`TODO(design)`)

데스크톱 상품 상세(사진 세로 + 오른쪽 400px sticky), 데스크톱 장바구니(가운데 560px), 품절 상품 상세(비활성 `sold` 버튼).

## 꼭 확인할 것

- **iPhone Safari에서 인트로 아이콘 모션**을 실제 기기로 봐 주세요. 팔다리가 제자리에서 도는지(관절이 튀지 않는지) 확인이 필요해요. 개발용 Chromium에서만 확인했어요.

## 아직 채워야 할 정보 (핸드오프 README 12)

- 클라이언트 확인: 인트로 로고·글자 흰색(원본은 크림색 실), 배송·반품 문구와 청약철회 표기, 가격(`₩ 000,000`)과 회원 전용 여부
- 디자이너 결정: 인트로를 매번 / 세션당 한 번 보여 줄지, 인트로 글자 목록을 링크로 만들지, `it's yours · view bag` 문구, 사이즈 필터, 하의·액세서리 사진 자르는 비율
- 데이터·연결: 전체 상품 수 127 / 300(가짜), 3599 외 상품의 상세 데이터, 새 상품의 hover 사진, 검색 범위(서버 검색), 담기 실패 처리(낙관적 업데이트 되돌리기), 데스크톱 상품 상세·장바구니·품절 상세 정식 디자인, 결제 연결, 로고 벡터, Neue Haas Grotesk 웹 키트, 인스타그램·이용약관·개인정보처리방침 링크, 배송 안내에서 뺀 문구
- 1차에서 이어지는 것: 룩북 사진·문구, 공지 날짜, 무통장 계좌, 리뷰 실데이터
