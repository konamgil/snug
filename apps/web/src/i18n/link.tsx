'use client';

import { forwardRef, useCallback, type MouseEvent, type ComponentProps } from 'react';
import { Link as NextIntlLink } from './navigation-base';
import { useNavigationLoading } from '@/shared/providers';
import { usePathname } from 'next/navigation';

type LinkProps = ComponentProps<typeof NextIntlLink>;

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { onClick, href, ...props },
  ref,
) {
  const { startLoading } = useNavigationLoading();
  const currentPathname = usePathname();

  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      // 외부 링크, 새 탭, 또는 modifier key 사용 시 로딩 표시 안 함
      const isExternal =
        typeof href === 'string' && (href.startsWith('http') || href.startsWith('//'));
      const isModifiedClick = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
      const isNewTab = props.target === '_blank';

      // 같은 경로면 로딩 표시 안 함
      const targetPath = typeof href === 'string' ? href : href?.pathname;
      const isSamePath = targetPath === currentPathname;

      if (!isExternal && !isModifiedClick && !isNewTab && !isSamePath) {
        startLoading();
      }

      onClick?.(e);
    },
    [onClick, href, startLoading, currentPathname, props.target],
  );

  return <NextIntlLink ref={ref} href={href} onClick={handleClick} {...props} />;
});
