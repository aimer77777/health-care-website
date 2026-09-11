import Link from "next/link";

export default function RootNotFound() {
  return (
    <main className="min-h-[80vh] flex flex-col justify-center items-center text-center gap-4">
      <h1>找不到頁面</h1>
      <p>The requested page could not be found.</p>
      <Link href="/" className="link">回到首頁</Link>
    </main>
  )
}
