# ARCHIVIN 웹사이트

`archivin-web-handoff/` 디자인을 코드로 옮긴 사이트예요. Next.js (App Router) + TypeScript + CSS Modules. UI 라이브러리는 쓰지 않았어요.

## 실행

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 프로덕션 빌드
npm start          # 빌드한 결과 실행
```

`npm run dev` / `npm run build` 전에 `tokens/tokens.json` → `app/tokens.css`(CSS 변수)가 자동으로 다시 만들어져요.
토큰을 바꿀 때는 `tokens/tokens.json`만 고치세요.

## 구조

| 경로 | 내용 |
|---|---|
| `app/` | 라우트 (README 4번 표 그대로). 900px 미만은 모바일 디자인, 이상은 데스크톱 디자인 |
| `components/` | TopBar, SiteHeader(+모바일 메뉴), DHeader, SiteFooter, DFooter, HomeFooter, ProductCard, Pagination, SiteChrome(페이지 틀) |
| `data/*.json` | 목업 데이터: 상품·공지·리뷰·룩북·매장 정보 |
| `lib/cart.ts` | 장바구니·위시리스트·내가 쓴 리뷰 (localStorage, 새로고침해도 유지) |
| `public/media/` | 홈 영상, 포스터 이미지 |
| `tokens/tokens.json` | 디자인 토큰 원본 |

## Futura PT (Adobe Fonts)

웹 프로젝트 키트 ID가 `.env`의 `NEXT_PUBLIC_TYPEKIT_ID`에 들어 있어요 (`ybe3ckj`). 키트가 없으면 Jost가 대신 보여요.
배포할 도메인이 생기면 Adobe Fonts 웹 프로젝트 설정에 그 도메인을 추가하세요.

## 아직 채워야 할 정보 (코드에 `TODO` / `[ ]` 자리표시로 남아 있음)

- **상품** (`data/products.json`): 사진, 가격(`price: null` → `₩ 000,000`), 사이즈(`null` → `[SIZE]`), 실측·상태·원단, 상품번호. Iggy Pop 외 상품의 카테고리는 임시로 정했어요.
- **룩북** (`data/lookbooks.json`): 사진, `[SEASON]`, `[PIECE]` 이름, 소개 문구, 룩북 피스와 실제 상품 연결(`productId`).
- **매장/링크** (`data/site.json`): 매장·지도 사진, 네이버/카카오 지도 URL, 인스타그램 아이디·URL, 이용약관·개인정보처리방침 URL.
- **공지** (`data/notices.json`): 날짜, 2021 오픈 공지 본문, 휴무 안내, 무통장 계좌, 하자 접수 기한 `[N]`일.
- **리뷰** (`data/reviews.json`): 실제 리뷰로 교체.
- **주문 완료** (`app/order/complete/CopyAccount.tsx`): 무통장 계좌 정보.

## 아직 연결하지 않은 것 (나중에)

- 결제(PG), 주문 저장 — `app/checkout/CheckoutView.tsx`의 `tryPay` TODO
- 로그인·회원가입·마이페이지 데이터 — `app/signin`, `app/mypage`
- 주소 검색 (Find address) — 다음 우편번호 등
- 리뷰 저장·사진 업로드 API — 지금은 이 기기에만 저장 (`lib/cart.ts`)
- 위시리스트 계정 연동
