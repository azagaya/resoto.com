import isInternalUrl from '@docusaurus/isInternalUrl';
import Link from '@docusaurus/Link';
import { isRegexpStringMatch } from '@docusaurus/theme-common';
import useBaseUrl from '@docusaurus/useBaseUrl';
import IconExternalLink from '@theme/IconExternalLink';
import type { Props } from '@theme/NavbarItem/NavbarNavLink';
import React from 'react';

const dropdownLinkActiveClass = 'dropdown__link--active';

export default function NavbarNavLink({
  activeBasePath,
  activeBaseRegex,
  to,
  href,
  label,
  activeClassName = '',
  prependBaseUrlToHref,
  ...props
}: Props): JSX.Element {
  // TODO all this seems hacky
  // {to: 'version'} should probably be forbidden, in favor of {to: '/version'}
  const toUrl = useBaseUrl(to);
  const activeBaseUrl = useBaseUrl(activeBasePath);
  const normalizedHref = useBaseUrl(href, { forcePrependBaseUrl: true });
  const isExternalLink = label && href && !isInternalUrl(href);
  const isDropdownLink = activeClassName === dropdownLinkActiveClass;

  return (
    <Link
      {...(href
        ? {
            href: prependBaseUrlToHref ? normalizedHref : href,
          }
        : {
            isNavLink: true,
            activeClassName: !props.className?.includes(activeClassName)
              ? activeClassName
              : '',
            to: toUrl,
            ...(activeBasePath || activeBaseRegex
              ? {
                  isActive: (_match, location) =>
                    activeBaseRegex
                      ? isRegexpStringMatch(activeBaseRegex, location.pathname)
                      : location.pathname.startsWith(activeBaseUrl),
                }
              : null),
          })}
      {...props}
    >
      <span>
        {label}
        {isExternalLink && (
          <IconExternalLink
            {...(isDropdownLink && { width: 12, height: 12 })}
          />
        )}
      </span>
    </Link>
  );
}
