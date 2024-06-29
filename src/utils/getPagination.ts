import { SITE } from "@config";
import getPageNumbers from "./getPageNumbers";

interface GetPaginationProps<T> {
  items: T;
  page: string | number;
  isIndex?: boolean;
}

const getPagination = <T>({
  items,
  page,
  isIndex = false,
}: GetPaginationProps<T[]>) => {
  const totalPagesArray = getPageNumbers(items.length);
  const totalPages = totalPagesArray.length;

  const currentPage = isIndex
    ? 1
    : page && !isNaN(Number(page)) && totalPagesArray.includes(Number(page))
      ? Number(page)
      : 0;

  const lastItem = isIndex ? SITE.postPerPage : currentPage * SITE.postPerPage;
  const firstItem = isIndex ? 0 : lastItem - SITE.postPerPage;
  const paginatedItems = items.slice(firstItem, lastItem);

  return {
    totalPages,
    currentPage,
    paginatedItems,
  };
};

export default getPagination;
