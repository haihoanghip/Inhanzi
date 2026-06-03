import { useEffect, useRef } from 'react';
import '../assets/css/base.css';
import '../assets/css/main.css';

const hskLevels = [
    {
        num: 1, level: 'l1', badge: 'HSK 1 · Sơ cấp A1', name: '入門 · Nhập môn',
        desc: '150 từ vựng cơ bản, giao tiếp đơn giản trong cuộc sống hàng ngày.',
    },
    {
        num: 2, level: 'l2', badge: 'HSK 2 · Cơ bản A2', name: '基礎 · Cơ bản',
        desc: '300 từ vựng, diễn đạt được các tình huống quen thuộc và đơn giản.',
    },
    {
        num: 3, level: 'l3', badge: 'HSK 3 · Trung cấp B1', name: '進階 · Tiến bộ',
        desc: '600 từ vựng, giao tiếp trôi chảy các chủ đề học tập, công việc, đời sống.',
    },
    {
        num: 4, level: 'l4', badge: 'HSK 4 · Trung cao B2', name: '中級 · Trung cấp',
        desc: '1200 từ, thảo luận các chủ đề đa dạng, hiểu nội dung phức tạp.',
    },
    {
        num: 5, level: 'l5', badge: 'HSK 5 · Cao cấp C1', name: '高級 · Thành thạo',
        desc: '2500 từ, đọc báo, xem phim tiếng Trung không cần phụ đề.',
    },
    {
        num: 6, level: 'l6', badge: 'HSK 6 · Thành thạo C2', name: '精通 · Tinh thông',
        desc: '5000+ từ, sử dụng tiếng Trung thành thạo trong mọi tình huống.',
    },
];

const features = [
    { icon: '🎧', title: 'Luyện Nghe', desc: 'Bài nghe chuẩn phát âm với transcript song ngữ, câu hỏi kiểm tra hiểu bài sau mỗi đoạn.' },
    { icon: '🎥', title: 'Thư viện Video', desc: 'Video học có phụ đề Trung–Việt, ghi nhớ vị trí xem dở, điều chỉnh tốc độ phát.' },
    { icon: '🃏', title: 'Flashcard thông minh', desc: 'Ôn từ vựng bằng thẻ lật có phát âm, thuật toán spaced repetition tối ưu việc ghi nhớ.' },
    { icon: '✍️', title: 'Luyện Viết chữ Hán', desc: 'Xem thứ tự nét viết chuẩn, luyện viết trực tiếp trên canvas với phản hồi tức thì.' },
    { icon: '📊', title: 'Theo dõi tiến độ', desc: 'Dashboard cá nhân hiển thị tiến độ từng kỹ năng, streak học tập và thành tích đạt được.' },
    { icon: '📝', title: 'Thi thử HSK', desc: 'Đề thi mô phỏng thật với giới hạn thời gian, phân tích điểm mạnh và điểm cần cải thiện.' },
];

const hskColors = {
    l1: { bg: 'rgba(46,204,113,0.08)', border: 'rgba(46,204,113,0.3)', num: '#2ecc71' },
    l2: { bg: 'rgba(52,152,219,0.08)', border: 'rgba(52,152,219,0.3)', num: '#3498db' },
    l3: { bg: 'rgba(155,89,182,0.08)', border: 'rgba(155,89,182,0.3)', num: '#9b59b6' },
    l4: { bg: 'rgba(230,126,34,0.08)', border: 'rgba(230,126,34,0.3)', num: '#e67e22' },
    l5: { bg: 'rgba(231,76,60,0.08)', border: 'rgba(231,76,60,0.3)', num: '#e74c3c' },
    l6: { bg: 'rgba(201,168,76,0.12)', border: 'rgba(201,168,76,0.4)', num: '#c9a84c' },
};

function HomePage({ onOpenModal }) {
    const floatAreaRef = useRef(null);
    const revealRefs = useRef([]);

    // Reveal on scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => entries.forEach(e => {
                if (e.isIntersecting) e.target.classList.add('revealed');
            }),
            { threshold: 0.1 }
        );
        revealRefs.current.forEach(el => el && observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const addRevealRef = (el) => {
        if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
    };

    return (
        <>
            <div className="container">
                {/* HERO */}
                <section className="hero">
                    <div className="float-chars" ref={floatAreaRef}></div>
                    <div className="hero-eyebrow">
                        <span></span>
                        Nền tảng học tiếng Trung toàn diện
                        <span></span>
                    </div>
                    <div className="hero-zh">漢語</div>
                    <div className="hero-title">Học tiếng Trung từ HSK1 đến HSK6</div>
                    <p className="hero-desc">
                        Nghe · Nói · Đọc · Viết · Video — Lộ trình học tập cá nhân hóa với tài liệu chuẩn quốc tế,
                        giúp bạn chinh phục tiếng Trung theo từng bước vững chắc.
                    </p>
                    <div className="hero-cta">
                        <button className="cta-primary" onClick={() => onOpenModal?.('login')}>
                            Bắt đầu học miễn phí
                        </button>
                    </div>
                </section>

                {/* DIVIDER */}
                <div className="divider">
                    <div className="divider-line">
                        <span className="divider-zh">· 六個等級 · Sáu cấp độ · 六个等级 ·</span>
                    </div>
                </div>

                {/* HSK LEVELS */}
                <section className="section" id="courses">
                    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                        <div className="section-label">Lộ trình học tập</div>
                        <div className="section-title">6 cấp độ HSK từ cơ bản đến thành thạo</div>
                        <p className="section-sub">
                            Mỗi cấp gồm đầy đủ 4 kỹ năng Nghe – Nói – Đọc – Viết kèm video và bài tập tương tác.
                        </p>
                        <div className="hsk-grid">
                            {hskLevels.map((item, i) => {
                                const colors = hskColors[item.level];
                                return (
                                    <div
                                        key={item.num}
                                        className="hsk-card reveal"
                                        ref={addRevealRef}
                                        style={{
                                            background: colors.bg,
                                            borderColor: colors.border,
                                            transitionDelay: `${i * 0.08}s`,
                                        }}
                                    >
                                        <div className="hsk-num" style={{ color: colors.num }}>{item.num}</div>
                                        <div className="hsk-badge">{item.badge}</div>
                                        <div className="hsk-name">{item.name}</div>
                                        <p className="hsk-desc">{item.desc}</p>
                                        <div className="hsk-skills">
                                            {['🎧 Nghe', '🗣 Nói', '📖 Đọc', '✍️ Viết'].map(s => (
                                                <span key={s} className="hsk-skill">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* DIVIDER */}
                <div className="divider">
                    <div className="divider-line">
                        <span className="divider-zh">· 功能特色 · Tính năng nổi bật ·</span>
                    </div>
                </div>

                {/* FEATURES */}
                <section className="section" id="features">
                    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                        <div className="section-label">Công nghệ học tập</div>
                        <div className="section-title">Mọi thứ bạn cần trong một nền tảng</div>
                        <div className="features-grid">
                            {features.map((feat, i) => (
                                <div
                                    key={feat.title}
                                    className="feat reveal"
                                    ref={addRevealRef}
                                    style={{ transitionDelay: `${i * 0.08}s` }}
                                >
                                    <div className="feat-icon">{feat.icon}</div>
                                    <div className="feat-title">{feat.title}</div>
                                    <p className="feat-desc">{feat.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            {/* FOOTER */}
            <footer className="footer">
                <div className="footer-logo">漢語學習 · HSK Learning</div>
                <div className="footer-copy">© 2026 HSK Learning Platform · Học tiếng Trung mỗi ngày</div>

            </footer>
            <p style={{
                color: '#13c2c2f0', display: 'flex',
                justifyContent: 'end', zIndex: '1000',
                fontSize: '1rem', marginRight: '20px', 
                userSelect: "none",

            }}>
                Version {import.meta.env.VITE_APP_VERSION}
            </p>
        </>
    );
}

export default HomePage;