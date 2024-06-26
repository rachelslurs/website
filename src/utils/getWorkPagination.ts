import { SITE } from "@config";
import getPageNumbers from "./getPageNumbers";

interface GetWorkPaginationProps<T> {
  work: T;
  page: string | number;
  isIndex?: boolean;
}

const getWorkPagination = <T>({
  work,
  page,
  isIndex = false,
}: GetWorkPaginationProps<T[]>) => {
  const totalPagesArray = getPageNumbers(work.length);
  const totalPages = totalPagesArray.length;

  const currentPage = isIndex
    ? 1
    : page && !isNaN(Number(page)) && totalPagesArray.includes(Number(page))
      ? Number(page)
      : 0;

  const lastPost = isIndex ? SITE.postPerPage : currentPage * SITE.postPerPage;
  const startPost = isIndex ? 0 : lastPost - SITE.postPerPage;
  const paginatedWork = work.slice(startPost, lastPost);

  return {
    totalPages,
    currentPage,
    paginatedWork,
  };
};

export default getWorkPagination;
