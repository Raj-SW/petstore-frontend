import { describe, it, expect, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import useApi, { usePaginatedApi } from "./useApi";

describe("useApi", () => {
  it("starts idle (no immediate call)", () => {
    const apiFunc = vi.fn();
    const { result } = renderHook(() => useApi(apiFunc));
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(apiFunc).not.toHaveBeenCalled();
  });

  it("starts with loading=true when immediate is set", () => {
    const { result } = renderHook(() =>
      useApi(vi.fn(), { immediate: true }),
    );
    expect(result.current.loading).toBe(true);
  });

  it("execute stores data, forwards args, and calls onSuccess", async () => {
    const apiFunc = vi.fn().mockResolvedValue({ id: 1 });
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useApi(apiFunc, { onSuccess }));

    let returned;
    await act(async () => {
      returned = await result.current.execute("x", 2);
    });

    expect(apiFunc).toHaveBeenCalledWith("x", 2);
    expect(returned).toEqual({ id: 1 });
    expect(result.current.data).toEqual({ id: 1 });
    expect(result.current.loading).toBe(false);
    expect(onSuccess).toHaveBeenCalledWith({ id: 1 });
  });

  it("execute sets error, calls onError, and re-throws on failure", async () => {
    const err = new Error("boom");
    const apiFunc = vi.fn().mockRejectedValue(err);
    const onError = vi.fn();
    const { result } = renderHook(() => useApi(apiFunc, { onError }));

    await act(async () => {
      await expect(result.current.execute()).rejects.toThrow("boom");
    });

    expect(result.current.error).toBe("boom");
    expect(result.current.loading).toBe(false);
    expect(onError).toHaveBeenCalledWith(err);
  });

  it("uses a fallback message when the error has no message", async () => {
    const apiFunc = vi.fn().mockRejectedValue({});
    const { result } = renderHook(() => useApi(apiFunc));
    await act(async () => {
      await expect(result.current.execute()).rejects.toBeTruthy();
    });
    expect(result.current.error).toBe("An error occurred");
  });

  it("reset clears data, error, and loading", async () => {
    const apiFunc = vi.fn().mockResolvedValue("ok");
    const { result } = renderHook(() => useApi(apiFunc));
    await act(async () => {
      await result.current.execute();
    });
    expect(result.current.data).toBe("ok");

    act(() => result.current.reset());
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});

describe("usePaginatedApi", () => {
  it("exposes data array, derived pagination flags, and fetches a page", async () => {
    const apiFunc = vi.fn().mockResolvedValue({
      data: [{ id: 1 }],
      pagination: { pages: 3, total: 25 },
    });
    const { result } = renderHook(() => usePaginatedApi(apiFunc, { q: "z" }));

    await act(async () => {
      await result.current.fetchData();
    });

    // fetchData merges params + the current page number.
    expect(apiFunc).toHaveBeenCalledWith({ q: "z", page: 1 });
    await waitFor(() => expect(result.current.data).toEqual([{ id: 1 }]));
    expect(result.current.totalPages).toBe(3);
    expect(result.current.totalItems).toBe(25);
    expect(result.current.hasPrevious).toBe(false);
    expect(result.current.hasNext).toBe(true);
  });

  it("nextPage advances the page and refetches", async () => {
    const apiFunc = vi.fn().mockResolvedValue({
      data: [],
      pagination: { pages: 2, total: 10 },
    });
    const { result } = renderHook(() => usePaginatedApi(apiFunc));

    await act(async () => {
      await result.current.fetchData(); // page 1, sets totalPages=2
    });
    act(() => result.current.nextPage());

    await waitFor(() => expect(result.current.page).toBe(2));
    expect(apiFunc).toHaveBeenLastCalledWith({ page: 2 });
    expect(result.current.hasNext).toBe(false);
    expect(result.current.hasPrevious).toBe(true);
  });
});
