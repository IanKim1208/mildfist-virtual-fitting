import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="flex-1" style={{ background: "#ffffff" }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm mb-6 no-underline"
          style={{ color: "#62625b" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          돌아가기
        </Link>

        <h1 className="text-xl font-semibold mb-6" style={{ color: "#211922" }}>
          이용약관
        </h1>

        <div className="flex flex-col gap-6 text-sm" style={{ color: "#62625b", lineHeight: 1.7 }}>
          <section>
            <h2 className="font-semibold mb-2" style={{ color: "#211922" }}>제1조 (목적)</h2>
            <p>
              이 약관은 MildFist (마일드피스트) AI 가상 피팅 서비스(이하 &quot;서비스&quot;)의 이용 조건 및 절차,
              회사와 회원 간의 권리, 의무 및 책임사항 등을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="font-semibold mb-2" style={{ color: "#211922" }}>제2조 (서비스 내용)</h2>
            <p>
              본 서비스는 AI 기술을 활용한 패션 아이템 인식, 가상 피팅, 유사 상품 검색 등의 기능을 제공합니다.
              본 서비스는 프로토타입 데모 버전으로, 실제 상용 서비스와 다를 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="font-semibold mb-2" style={{ color: "#211922" }}>제3조 (크레딧)</h2>
            <p>
              가상 피팅 기능 이용 시 크레딧이 차감됩니다.
              본 데모에서의 크레딧 충전은 실제 결제가 이루어지지 않으며, 테스트 목적으로만 제공됩니다.
            </p>
          </section>

          <section>
            <h2 className="font-semibold mb-2" style={{ color: "#211922" }}>제4조 (개인정보)</h2>
            <p>
              본 데모 서비스에서 수집되는 개인정보(이메일, 이름)는 서비스 제공 목적으로만 사용되며,
              데모 종료 시 모든 데이터가 삭제됩니다.
            </p>
          </section>

          <section>
            <h2 className="font-semibold mb-2" style={{ color: "#211922" }}>제5조 (면책)</h2>
            <p>
              AI가 생성하는 가상 피팅 결과는 실제 착용 모습과 다를 수 있으며,
              회사는 AI 생성 결과의 정확성을 보장하지 않습니다.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-4" style={{ borderTop: "1px solid #e5e5e0" }}>
          <p className="text-xs" style={{ color: "#91918c" }}>
            본 약관은 프로토타입 데모용이며, 실제 서비스 출시 시 정식 약관으로 대체됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
