# ARCHIVIN 웹사이트

`archivin-web-handoff-v2` 디자인(인트로 + A-2.1)을 코드로 옮긴 사이트예요. Next.js (App Router) + TypeScript + CSS Modules. UI 라이브러리는 쓰지 않았어요.

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
| `app/page.tsx` | 인트로 (남색, 헤더·푸터 없음) |
| `app/shop` | shop. 카테고리·필터·정렬은 모두 URL 쿼리(`?cat=outer&brand=levis&size=m,l&era=90s&sold=1&sort=price-asc`) |
| `app/product/[id]`, `app/bag` | 상품 상세, 장바구니 (푸터 없음) |
| `app/about`, `lookbook`, `notice`, `reviews`, `search` | 1차 화면 유지. 새 헤더·푸터·토큰만 적용 |
| `app/checkout`, `order/complete`, `signin`, `mypage` | parked 화면 (UI만) |
| `components/Header` | 모바일 Header, 데스크톱 DHeader, bag 링크, menu 패널 |
| `components/CategoryMenu`, `Filter`, `ProductCard`, `Accordion`, `Footer` | 공용 컴포넌트 |
| `lib/shop.ts` | 필터·정렬·URL 쿼리 규칙 |
| `lib/cart.ts` | 장바구니 (localStorage) |
| `data/products.json` | 상품 목업 14개 (v2 핸드오프) |
| `public/logo`, `public/products` | 스티치 로고, 상품 사진 |

## 글꼴

Neue Haas Grotesk Text(Adobe Fonts) 웹 키트가 생기면 `.env`의 `NEXT_PUBLIC_TYPEKIT_ID`에 키트 ID를 넣으세요. 그 전에는 Helvetica Neue / Arial로 보여요. 한글은 Noto Sans KR이에요.

## 디자인 없이 제안대로 만든 화면 (`TODO(design)`)

데스크톱 상품 상세(사진 세로 + 오른쪽 sticky), 데스크톱 장바구니(가운데 560px), menu 패널, 품절 상품 상세(비활성 `sold` 버튼).

## 아직 채워야 할 정보 (핸드오프 README 11)

- 가격 (`₩ 000,000` 자리표시). 회원에게만 보여 줄지 정하기
- 전체 상품 수 127 / 300 (가짜 숫자, `data/products.json`의 `totals`)
- 상품 상세 데이터: 3599만 있어요. 나머지는 사진 1장뿐이라 아코디언이 숨겨져요
- 인트로 카테고리(band · designer · rap · skate · archive)별 화면과 상품 태그. 지금은 모두 `/shop`으로 가요
- menu 패널, 데스크톱 상품 상세·장바구니, 품절 상품 상세의 정식 디자인
- 결제 화면과 결제 연결 (지금 checkout을 누르면 `prototype — payment isn't connected.` 안내)
- 로고 벡터 파일(SVG), Neue Haas Grotesk 웹 키트
- 인스타그램 주소, 이용약관·개인정보처리방침 링크 (`data/site.json`)
- 배송·반품 안내 원문 중 뺀 부분('오후 3시 전 주문 시', '데미지·오염에 민감하신 분께는 추천하지 않음')
- 1차에서 이어지는 것: 룩북 사진·문구, 공지 날짜, 무통장 계좌, 리뷰 실데이터
