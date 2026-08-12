"use client";

import { use } from "react";

// key별 프로미스를 모듈 캐시에 담아 Suspense로 읽는 리소스 훅을 생성한다.
// React 19 use()만으로 캐시 + 중복요청 제거 + 로딩 상태를 deps 0으로 제공한다.
// (fetch surface가 늘어도 이 팩토리 하나를 재사용 — GeneDetail/Pathway 공용)
export function makeResourceHook<T>(loader: (key: string) => Promise<T>) {
  const cache = new Map<string, Promise<T>>();
  return function useResource(key: string): T {
    let p = cache.get(key);
    if (!p) {
      p = loader(key);
      cache.set(key, p);
    }
    return use(p);
  };
}
