import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import membershipRouter from "./membership";
import membersRouter from "./members";
import eventsRouter from "./events";
import groupsRouter from "./groups";
import teamRouter from "./team";
import citiesRouter from "./cities";
import notificationsRouter from "./notifications";
import adminRouter from "./admin";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(membershipRouter);
router.use(membersRouter);
router.use(eventsRouter);
router.use(groupsRouter);
router.use(teamRouter);
router.use(citiesRouter);
router.use(notificationsRouter);
router.use("/v1/admin", adminRouter);
router.use(statsRouter);

export default router;
