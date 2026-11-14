/** Only follow same-site paths from ?next=, never another origin. */
export function safeNext(value) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}
