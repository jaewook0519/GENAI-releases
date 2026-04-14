export default function WebView() {
  return (
    <div className="flex h-full flex-col">
      <iframe
        src="https://novelai.net"
        className="h-full w-full border-0"
        title="NovelAI"
      />
    </div>
  );
}
