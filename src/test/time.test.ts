import { describe, expect, it } from "vitest";
import raw from "@/data/menu.json";
import type { Day, Menu } from "@/data/menu.types";
import { dubaiNow, formatClock, formatDays, happyHourState, isOpen, todaysItems } from "@/lib/time";

const menu = raw as Menu;
const hours = menu.restaurant.hours.daily;
const happyHour = menu.groups.find((g) => g.id === "happy-hour");
const at = (day: Day, hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return { day, minutes: h * 60 + m };
};

describe("dubaiNow", () => {
  it("Sunday 08:00 in Dubai (04:00 UTC)", () => {
    // 2026-11-01 is a Sunday.
    expect(dubaiNow(new Date("2026-11-01T04:00:00Z"))).toEqual({ day: "sun", minutes: 480 });
  });
  it("Friday 23:59 in Dubai", () => {
    expect(dubaiNow(new Date("2026-11-06T19:59:00Z"))).toEqual({ day: "fri", minutes: 1439 });
  });
  it("rolls over at Dubai midnight, not UTC midnight", () => {
    expect(dubaiNow(new Date("2026-11-06T20:00:00Z"))).toEqual({ day: "sat", minutes: 0 });
    // 22:30 UTC Friday is already 02:30 Saturday in Dubai.
    expect(dubaiNow(new Date("2026-11-06T22:30:00Z"))).toEqual({ day: "sat", minutes: 150 });
  });
});

describe("isOpen", () => {
  it("is closed at 05:59 and open at 06:00", () => {
    expect(isOpen(at("mon", "05:59"), hours)).toBe(false);
    expect(isOpen(at("mon", "06:00"), hours)).toBe(true);
  });
  it('treats "24:00" as midnight', () => {
    expect(hours.close).toBe("24:00");
    expect(isOpen(at("mon", "23:59"), hours)).toBe(true);
    expect(isOpen(at("tue", "00:00"), hours)).toBe(false);
  });
  it("handles hours that cross midnight", () => {
    expect(isOpen(at("mon", "01:00"), { open: "18:00", close: "02:00" })).toBe(true);
    expect(isOpen(at("mon", "03:00"), { open: "18:00", close: "02:00" })).toBe(false);
  });
});

describe("todaysItems", () => {
  const names = (day: Day) => todaysItems(menu, at(day, "12:00")).map((e) => e.item.name);
  it("Sunday: Chatti Choru and Kallil Chutta Chicken (Pepper)", () => {
    expect(names("sun")).toEqual(["Chatti Choru", "Kallil Chutta Chicken (Pepper)"]);
  });
  it("Monday: Chicken Majboos", () => {
    expect(names("mon")).toEqual(["Chicken Majboos"]);
  });
  it("Tuesday: Palli Choru", () => {
    expect(names("tue")).toEqual(["Palli Choru"]);
  });
  it("Wednesday: Erachi Choru (Beef)", () => {
    expect(names("wed")).toEqual(["Erachi Choru (Beef)"]);
  });
  it("Thursday: Ghee Rice with Beef Ularth and Kallil Chutta Chicken (Normal)", () => {
    expect(names("thu")).toEqual(["Ghee Rice with Beef Ularth", "Kallil Chutta Chicken (Normal)"]);
  });
  it("Friday: only Kallil Chutta Chicken (Pepper)", () => {
    expect(names("fri")).toEqual(["Kallil Chutta Chicken (Pepper)"]);
  });
  it("Saturday: Kerala Pazhankanji and Kallil Chutta Chicken (Normal)", () => {
    expect(names("sat")).toEqual(["Kerala Pazhankanji", "Kallil Chutta Chicken (Normal)"]);
  });
});

describe("happyHourState", () => {
  it("Monday around the 4 PM to 7 PM window", () => {
    expect(happyHourState(happyHour, at("mon", "15:59"))).toBe("later-today");
    expect(happyHourState(happyHour, at("mon", "16:00"))).toBe("on");
    expect(happyHourState(happyHour, at("mon", "18:59"))).toBe("on");
    expect(happyHourState(happyHour, at("mon", "19:00"))).toBe("off");
  });
  it("Saturday 17:00 is off", () => {
    expect(happyHourState(happyHour, at("sat", "17:00"))).toBe("off");
  });
  it("is off for a group without a window", () => {
    expect(happyHourState(menu.groups[0], at("mon", "17:00"))).toBe("off");
  });
});

describe("formatting helpers", () => {
  it("formats clock times", () => {
    expect(formatClock("16:00")).toBe("4 PM");
    expect(formatClock("19:00")).toBe("7 PM");
    expect(formatClock("06:00")).toBe("6 AM");
    expect(formatClock("24:00")).toBe("midnight");
  });
  it("formats day lists", () => {
    expect(formatDays(["sun"])).toBe("Sundays");
    expect(formatDays(["thu", "sat"])).toBe("Thu and Sat");
    expect(formatDays(["fri", "sun"])).toBe("Fri and Sun");
    expect(formatDays(["mon", "tue", "wed", "thu", "fri"])).toBe("Mon to Fri");
  });
});
