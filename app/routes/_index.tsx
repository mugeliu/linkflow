import { type MetaFunction, type LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getCurrentUser } from "~/services/auth.server";
import { Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import type {
  Feature,
  Step,
  Testimonial,
  FAQ,
  PricingPlan,
  LazyImageProps,
} from "~/types/index";

export const meta: MetaFunction = () => {
  return [
    { title: "LinkFlow - 智能网址收藏与搜索平台" },
    {
      description:
        "一站式智能网址管理与搜索解决方案，让您的收藏更有序、搜索更高效",
    },
  ];
};

// 添加 loader 获取用户信息
export const loader: LoaderFunction = async ({ request }) => {
  const user = await getCurrentUser(request);
  return json({ user });
};

export default function Index() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [openFAQs, setOpenFAQs] = useState<number[]>([]);
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const { user } = useLoaderData<typeof loader>();

  useEffect(() => {
    const preloadImages = () => {
      testimonials.forEach((testimonial) => {
        const img = new Image();
        img.src = testimonial.avatar;
      });
    };

    preloadImages();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector("header");
      if (header) {
        if (window.scrollY > 50) {
          header.classList.add("bg-gray-900/95");
          header.classList.remove("bg-gray-900/80");
        } else {
          header.classList.add("bg-gray-900/80");
          header.classList.remove("bg-gray-900/95");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      const toggleVisibility = () => {
        setIsVisible(window.pageYOffset > 500);
      };

      window.addEventListener("scroll", toggleVisibility);
      return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

    return (
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 p-3 bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </motion.button>
    );
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQs((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {isLoading ? (
          <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-4xl text-blue-500"
            >
              LinkFlow
            </motion.div>
          </div>
        ) : (
          <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-md">
              <nav className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Link
                      to="/"
                      className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent"
                    >
                      LinkFlow
                    </Link>
                  </div>

                  {/* Desktop Navigation */}
                  <div className="hidden md:flex items-center space-x-6">
                    <Link
                      to="/features"
                      className="hover:text-blue-400 transition"
                    >
                      功能
                    </Link>
                    <Link
                      to="/pricing"
                      className="hover:text-blue-400 transition"
                    >
                      价格
                    </Link>
                    <Link
                      to="/about"
                      className="hover:text-blue-400 transition"
                    >
                      关于我们
                    </Link>

                    {user ? (
                      <Link
                        to={`/${user.name}`}
                        className="group relative flex items-center gap-2 px-3 py-1 rounded-full transition duration-200"
                      >
                        <div className="relative">
                          {/* 添加发光效果底层 */}
                          <div className="absolute -inset-0.5 rounded-full opacity-0 group-hover:opacity-100 blur bg-blue-500/20 transition duration-300" />

                          <Avatar className="relative h-8 w-8 ring-offset-background transition-all duration-300 group-hover:ring-2 group-hover:ring-blue-500/50 group-hover:ring-offset-2">
                            {user.avatar ? (
                              <AvatarImage
                                src={user.avatar}
                                alt={user.name}
                                className="transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <AvatarFallback className="bg-gradient-to-br from-blue-500/50 to-violet-500/50 text-white text-xl transition-transform duration-300 group-hover:scale-105">
                                {user.name[0].toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </div>
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="px-4 py-2 rounded-lg hover:text-blue-400 transition"
                        >
                          登录
                        </Link>
                        <Link
                          to="/signup"
                          className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
                        >
                          免费开始
                        </Link>
                      </>
                    )}
                  </div>

                  {/* Mobile Menu Button */}
                  <button
                    className="md:hidden p-2"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {isMobileMenuOpen ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      )}
                    </svg>
                  </button>
                </div>

                {/* Mobile Navigation */}
                <motion.div
                  initial={false}
                  animate={
                    isMobileMenuOpen
                      ? { height: "auto", opacity: 1 }
                      : { height: 0, opacity: 0 }
                  }
                  className="md:hidden overflow-hidden"
                >
                  <div className="py-4 space-y-4">
                    <Link
                      to="/features"
                      className="block hover:text-blue-400 transition"
                    >
                      功能
                    </Link>
                    <Link
                      to="/pricing"
                      className="block hover:text-blue-400 transition"
                    >
                      价格
                    </Link>
                    <Link
                      to="/about"
                      className="block hover:text-blue-400 transition"
                    >
                      关于我们
                    </Link>
                    <Link
                      to="/login"
                      className="block hover:text-blue-400 transition"
                    >
                      登录
                    </Link>
                    <Link
                      to="/signup"
                      className="block px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition text-center"
                    >
                      免费开始
                    </Link>
                  </div>
                </motion.div>
              </nav>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden min-h-screen flex items-center">
              {/* 背景动画效果 */}
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-blue-500/10 animate-gradient" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-0 left-0 w-full h-full">
                  <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl animate-float" />
                  <div className="absolute bottom-20 right-20 w-40 h-40 bg-violet-500/20 rounded-full blur-2xl animate-float-delay" />
                </div>
                {/* 添加网格背景 */}
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px]" />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="container mx-auto text-center relative z-10"
              >
                {/* 顶部标签 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-block mb-6"
                >
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-full">
                    <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-sm font-medium">
                      全新升级的智能书签管理体验
                    </span>
                  </div>
                </motion.div>

                {/* 主标题 */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400 bg-clip-text text-transparent"
                >
                  重新定义
                  <br className="hidden md:block" />
                  网址收藏体验
                </motion.h1>

                {/* 副标题 */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed"
                >
                  智能分类 · 快速检索 · AI 助手
                  <br />
                  让您的网络资源管理更轻松
                </motion.p>

                {/* 按钮组 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-col md:flex-row justify-center gap-4 mb-12"
                >
                  <Link
                    to="/signup"
                    className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-violet-500 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
                  >
                    <span className="relative z-10 font-semibold">
                      立即开始使用
                    </span>
                  </Link>
                  <Link
                    to="/demo"
                    className="group px-8 py-4 bg-gray-800/80 backdrop-blur-sm rounded-lg transition-all duration-300 hover:scale-105 hover:bg-gray-800"
                  >
                    <span className="font-semibold">查看演示</span>
                  </Link>
                </motion.div>

                {/* 数据统计 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
                >
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent mb-2">
                        {stat.value}
                      </div>
                      <div className="text-gray-400 text-sm">{stat.label}</div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6 bg-gray-900/50 backdrop-blur-md relative overflow-hidden">
              {/* 背景装饰 */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:30px_30px]" />
                <div className="absolute top-0 left-0 w-full h-full">
                  <div className="absolute top-10 right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-xl" />
                  <div className="absolute bottom-10 left-10 w-32 h-32 bg-violet-500/10 rounded-full blur-xl" />
                </div>
              </div>

              <div className="container mx-auto relative z-10">
                {/* 标题部分 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-16"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="inline-block px-4 py-2 bg-blue-500/10 rounded-full mb-4"
                  >
                    <span className="text-blue-400 text-sm font-medium">
                      为什么选择我们
                    </span>
                  </motion.div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    让书签管理变得简单
                  </h2>
                  <p className="text-gray-400 max-w-2xl mx-auto">
                    我们提供直观的界面和强大的功能，帮助您更好地组织和管理网络资源
                  </p>
                </motion.div>

                {/* 特性卡片 */}
                <div className="grid md:grid-cols-3 gap-8">
                  {features.map((feature, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 }}
                      whileHover={{
                        scale: 1.05,
                        transition: { duration: 0.2 },
                      }}
                      key={index}
                      className="group p-8 rounded-2xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-800/50 hover:border-blue-500/50 transition-all duration-300"
                    >
                      <div className="mb-6 relative">
                        <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                          {feature.icon}
                        </div>
                        <div className="absolute -inset-2 bg-blue-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <h3 className="text-xl font-semibold mb-4 group-hover:text-blue-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* How it Works */}
            <section className="py-20 px-6 relative overflow-hidden">
              {/* 背景效果 */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:30px_30px]" />
                <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-10 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
              </div>

              <div className="container mx-auto relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-16"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="inline-block px-4 py-2 bg-blue-500/10 rounded-full mb-4"
                  >
                    <span className="text-blue-400 text-sm font-medium">
                      简单四步
                    </span>
                  </motion.div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    开始使用 LinkFlow
                  </h2>
                  <p className="text-gray-400 max-w-2xl mx-auto">
                    只需简单几步，即可开始享受智能书签管理体验
                  </p>
                </motion.div>

                <div className="grid md:grid-cols-4 gap-8 relative">
                  {/* 连接线 */}
                  <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500/50 via-violet-500/50 to-blue-500/50 transform -translate-y-1/2" />

                  {steps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 }}
                      className="relative text-center"
                    >
                      <div className="relative z-10 mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center mx-auto mb-4 transform transition-transform group-hover:scale-110">
                          <span className="text-2xl font-bold text-white">
                            {index + 1}
                          </span>
                        </div>
                        <div className="absolute -inset-2 bg-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-400">{step.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 px-6 bg-gray-900/50 backdrop-blur-md relative overflow-hidden">
              {/* 背景效果 */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:30px_30px]" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
              </div>

              <div className="container mx-auto relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-16"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="inline-block px-4 py-2 bg-blue-500/10 rounded-full mb-4"
                  >
                    <span className="text-blue-400 text-sm font-medium">
                      用户反馈
                    </span>
                  </motion.div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    他们都在使用 LinkFlow
                  </h2>
                  <p className="text-gray-400 max-w-2xl mx-auto">
                    来自不同行业的用户分享他们使用 LinkFlow 的心得体验
                  </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                  {testimonials.map((testimonial, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 }}
                      className="group p-8 rounded-2xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-800/50 hover:border-blue-500/50 transition-all duration-300"
                    >
                      {/* 引号装饰 */}
                      <div className="text-4xl text-blue-500/20 mb-4">"</div>

                      <p className="text-gray-300 mb-6 leading-relaxed">
                        {testimonial.content}
                      </p>

                      <div className="flex items-center">
                        <div className="relative">
                          <LazyImage
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            className="w-12 h-12 rounded-full border-2 border-blue-500/50"
                          />
                          <div className="absolute -inset-1 bg-blue-500/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="ml-4">
                          <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                            {testimonial.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            {testimonial.title}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 px-6 relative overflow-hidden">
              {/* 背景效果 */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:30px_30px]" />
                <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-10 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
              </div>

              <div className="container mx-auto relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-16"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="inline-block px-4 py-2 bg-blue-500/10 rounded-full mb-4"
                  >
                    <span className="text-blue-400 text-sm font-medium">
                      常见问题
                    </span>
                  </motion.div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    有疑问？我们来解答
                  </h2>
                  <p className="text-gray-400 max-w-2xl mx-auto">
                    这里列出了用户最常见的问题，如果没有找到您需要的答案，欢迎联系我们
                  </p>
                </motion.div>

                <div className="max-w-3xl mx-auto space-y-4">
                  {faqs.map((faq, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className={`group p-6 rounded-xl backdrop-blur-sm border transition-all duration-300 ${
                        openFAQs.includes(index)
                          ? "bg-blue-500/10 border-blue-500/50"
                          : "bg-gray-800/50 border-gray-800/50 hover:border-blue-500/30"
                      }`}
                    >
                      <button
                        onClick={() => toggleFAQ(index)}
                        className="w-full text-left"
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-semibold group-hover:text-blue-400 transition-colors">
                            {faq.question}
                          </h3>
                          <motion.span
                            animate={{
                              rotate: openFAQs.includes(index) ? 180 : 0,
                            }}
                            transition={{ duration: 0.2 }}
                            className="text-blue-400"
                          >
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </motion.span>
                        </div>
                      </button>
                      <motion.div
                        initial={false}
                        animate={{
                          height: openFAQs.includes(index) ? "auto" : 0,
                          opacity: openFAQs.includes(index) ? 1 : 0,
                          marginTop: openFAQs.includes(index) ? 16 : 0,
                        }}
                        className="overflow-hidden"
                      >
                        <p className="text-gray-400 leading-relaxed">
                          {faq.answer}
                        </p>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Pricing Section */}
            <section className="py-20 px-6 bg-gray-900/50 backdrop-blur-md relative overflow-hidden">
              {/* 背景效果 */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:30px_30px]" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
              </div>

              <div className="container mx-auto relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-16"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="inline-block px-4 py-2 bg-blue-500/10 rounded-full mb-4"
                  >
                    <span className="text-blue-400 text-sm font-medium">
                      定价方案
                    </span>
                  </motion.div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    选择适合您的方案
                  </h2>
                  <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                    无论您是个人用户还是企业团队，我们都有适合您的解决方案
                  </p>

                  {/* 计费周期切换 */}
                  <div className="flex justify-center items-center gap-4 mb-12">
                    <button
                      onClick={() => setBillingInterval("monthly")}
                      className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                        billingInterval === "monthly"
                          ? "bg-blue-500 text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      月付
                    </button>
                    <div className="relative">
                      <div className="w-12 h-6 bg-blue-500/20 rounded-full">
                        <motion.div
                          animate={{
                            x: billingInterval === "monthly" ? 0 : 24,
                          }}
                          className="w-6 h-6 bg-blue-500 rounded-full"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => setBillingInterval("yearly")}
                      className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                        billingInterval === "yearly"
                          ? "bg-blue-500 text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      年付
                      <span className="ml-2 text-sm text-blue-400">省20%</span>
                    </button>
                  </div>
                </motion.div>

                {/* 价格卡片 */}
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  {pricingPlans.map((plan, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 }}
                      className={`group p-8 rounded-xl backdrop-blur-sm border transition-all duration-300 ${
                        plan.popular
                          ? "bg-blue-500/10 border-blue-500/50"
                          : "bg-gray-800/50 border-gray-800/50 hover:border-blue-500/30"
                      }`}
                    >
                      {plan.popular && (
                        <span className="px-3 py-1 text-sm bg-blue-500 rounded-full mb-4 inline-block">
                          最受欢迎
                        </span>
                      )}
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold">
                          {billingInterval === "yearly"
                            ? `￥${parseInt(plan.price.replace("￥", "")) * 10}`
                            : plan.price}
                        </span>
                        {plan.price !== "免费" && (
                          <span className="text-gray-400">
                            /{billingInterval === "yearly" ? "年" : "月"}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 mb-6">{plan.description}</p>
                      <ul className="space-y-4 mb-8">
                        {plan.features.map((feature, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center"
                          >
                            <svg
                              className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span className="text-gray-300">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                      <Link
                        to={plan.link}
                        className={`block text-center py-3 px-6 rounded-lg transition-all duration-300 ${
                          plan.popular
                            ? "bg-blue-500 hover:bg-blue-600 hover:scale-105"
                            : "bg-gray-700 hover:bg-gray-600 hover:scale-105"
                        }`}
                      >
                        {plan.buttonText}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 py-12 px-6">
              <div className="container mx-auto">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                  <div>
                    <h3 className="text-xl font-bold mb-4">LinkFlow</h3>
                    <p className="text-gray-400">重新定义您的网址收藏体验</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">产品</h4>
                    <ul className="space-y-2 text-gray-400">
                      <li>
                        <Link to="/features">功能</Link>
                      </li>
                      <li>
                        <Link to="/pricing">价格</Link>
                      </li>
                      <li>
                        <Link to="/enterprise">企业版</Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">资源</h4>
                    <ul className="space-y-2 text-gray-400">
                      <li>
                        <Link to="/docs">文档</Link>
                      </li>
                      <li>
                        <Link to="/blog">博客</Link>
                      </li>
                      <li>
                        <Link to="/help">帮助中心</Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">公司</h4>
                    <ul className="space-y-2 text-gray-400">
                      <li>
                        <Link to="/about">关于我们</Link>
                      </li>
                      <li>
                        <Link to="/contact">联系我们</Link>
                      </li>
                      <li>
                        <Link to="/careers">加入我们</Link>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="pt-8 border-t border-gray-800 text-center text-gray-400">
                  <p>© {new Date().getFullYear()} LinkFlow. 保留所有权利。</p>
                </div>
              </div>
            </footer>
            <ScrollToTop />
          </div>
        )}
      </motion.div>
    </>
  );
}

const features: Feature[] = [
  {
    icon: "🎯",
    title: "智能分类",
    description: "基于 AI 的自动分类系统，让您的书签自动归类整理",
  },
  {
    icon: "🔍",
    title: "快速搜索",
    description: "强大的搜索引擎，支持全文检索和智能推荐",
  },
  {
    icon: "🤖",
    title: "AI 助手",
    description: "智能助��帮您管理和发现有价值的网络资源",
  },
];

const steps: Step[] = [
  {
    title: "册账号",
    description: "简单几步，快速开始使用",
  },
  {
    title: "导入书签",
    description: "一键导入现有书签",
  },
  {
    title: "智能整理",
    description: "AI 自动分类您的书签",
  },
  {
    title: "开始使用",
    description: "享受高效的书签管理体验",
  },
];

const testimonials: Testimonial[] = [
  {
    content:
      "LinkFlow 彻底改变了我理网络资源的方式，再也不用担心书签混乱的问题了。",
    name: "张明",
    title: "产品经理",
    avatar: "/avatars/user1.svg",
  },
  {
    content: "智能分类功能棒了，为我节省了大量整理时间。",
    name: "李华",
    title: "自职业者",
    avatar: "/avatars/user2.svg",
  },
  {
    content:
      "搜索功能非常强大，找东西变得超级容易。让我再也不担心书签混乱的问题了。",
    name: "王芳",
    title: "研究员",
    avatar: "/avatars/user3.svg",
  },
];

const faqs: FAQ[] = [
  {
    question: "LinkFlow 如何保护我的数据安全？",
    answer:
      "我们采用业界领先的加密技术和安全措施，确保您的数据安全。所有数据都经过端到端加密，并存储在安全的云服务器中。",
  },
  {
    question: "我可以从其他浏览器导入书签吗？",
    answer:
      "是的，LinkFlow 支持从 Chrome、Firefox、Safari 等主流浏览器一键导入书签。导入程���单快捷，无需手动操作",
  },
  {
    question: "LinkFlow 的 AI 分类功能如何工作？",
    answer:
      "我们的 AI 系统会分析您的书签内容、标题和标签，自动将其归类到相应的分类中。您也可以随时调整和自定义分类规则。",
  },
  {
    question: "是否支持团队协作？",
    answer:
      "是的，我们提供团队版本，支持多人协作、权限管理、书签共享等功能，非常适合团队使用。",
  },
];

const pricingPlans: PricingPlan[] = [
  {
    name: "基础版",
    price: "免费",
    description: "适合个人用使用",
    features: [
      "最多保存 1000 个书签",
      "基础AI分类功能",
      "快速搜索",
      "浏览器插件支持",
    ],
    popular: false,
    buttonText: "开始使用",
    link: "/signup",
  },
  {
    name: "专业版",
    price: "￥29",
    description: "适合重度用户使用",
    features: [
      "无限书签存储",
      "高级AI分类功能",
      "全文检索",
      "多设备步",
      "优先客服支持",
    ],
    popular: true,
    buttonText: "升级专业版",
    link: "/pricing/pro",
  },
  {
    name: "团队版",
    price: "￥99",
    description: "适合团队协作使用",
    features: [
      "所有专业版功能",
      "团队协作功能",
      "高级权限管理",
      "团队共享空间",
      "专属客户经理",
    ],
    popular: false,
    buttonText: "联系销售",
    link: "/pricing/team",
  },
];

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className = "" }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} transition-opacity duration-300 ${
        isLoaded ? "opacity-100" : "opacity-0"
      }`}
      onLoad={() => setIsLoaded(true)}
      loading="lazy"
    />
  );
};

const stats = [
  { value: "100,000+", label: "活跃用户" },
  { value: "1,000万+", label: "已保存书签" },
  { value: "99.9%", label: "服务可用性" },
];
