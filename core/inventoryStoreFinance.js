(function (global) {
  function createFinanceModule(ctx) {
    const {
      getReceivables, setReceivables,
      getPayables, setPayables,
      getPayments, setPayments,
      nextReceivableId, incNextReceivableId,
      nextPayableId, incNextPayableId,
      nextPaymentId, incNextPaymentId
    } = ctx;

    const models = global.ClaudeOpenStockFlowModels || (typeof require !== "undefined" ? require("./inventoryModels") : {});
    const {
      normalizeReceivable, copyReceivable,
      normalizePayable, copyPayable,
      normalizePayment, copyPayment,
      financeStatus
    } = models;

    function normalizeText(value) {
      return String(value || "").trim();
    }

    function normalizeDocumentNoList(value) {
      if (!Array.isArray(value)) return [];
      return value.map(normalizeText).filter(Boolean);
    }

    function mergeDocumentNos(current, additions) {
      return Array.from(new Set(normalizeDocumentNoList(current).concat(normalizeDocumentNoList(additions))));
    }

    function appendNote(note, addition) {
      const current = normalizeText(note);
      return current ? `${current}; ${addition}` : addition;
    }

    function addReceivable(input) {
      const receivable = normalizeReceivable(input, nextReceivableId());
      if (!receivable) return null;
      incNextReceivableId();
      setReceivables([receivable].concat(getReceivables()));
      return copyReceivable(receivable);
    }

    function addPayable(input) {
      const payable = normalizePayable(input, nextPayableId());
      if (!payable) return null;
      incNextPayableId();
      setPayables([payable].concat(getPayables()));
      return copyPayable(payable);
    }

    function addPayment(input) {
      const payment = normalizePayment(input, nextPaymentId());
      if (!payment) return null;

      if (payment.targetType === "receivable" && payment.direction !== "in") {
        return { error: "INVALID_PAYMENT_DIRECTION" };
      }
      if (payment.targetType === "payable" && payment.direction !== "out") {
        return { error: "INVALID_PAYMENT_DIRECTION" };
      }

      const target = payment.targetType === "receivable"
        ? getReceivables().find((item) => item.id === payment.targetId)
        : getPayables().find((item) => item.id === payment.targetId);

      if (!target || target.status === "voided") return null;

      const remaining = target.amount - target.paidAmount;
      if (payment.amount > remaining) {
        return { error: "PAYMENT_EXCEEDS_BALANCE" };
      }

      incNextPaymentId();
      setPayments([payment].concat(getPayments()));
      applyPaymentToTarget(payment);
      return copyPayment(payment);
    }

    function applyPaymentToTarget(payment) {
      if (payment.targetType === "receivable") {
        setReceivables(getReceivables().map((receivable) => {
          if (receivable.id !== payment.targetId) return receivable;
          const paidAmount = receivable.paidAmount + payment.amount;
          return Object.assign({}, receivable, { paidAmount, status: financeStatus(receivable.amount, paidAmount) });
        }));
        return;
      }
      setPayables(getPayables().map((payable) => {
        if (payable.id !== payment.targetId) return payable;
        const paidAmount = payable.paidAmount + payment.amount;
        return Object.assign({}, payable, { paidAmount, status: financeStatus(payable.amount, paidAmount) });
      }));
    }

    function listReceivables(options) {
      const filter = Object.assign({ query: "", status: "", month: "" }, options);
      const query = normalizeText(filter.query).toLowerCase();
      return getReceivables()
        .filter((receivable) => !filter.status || receivable.status === filter.status)
        .filter((receivable) => !filter.month || receivable.dueDate.slice(0, 7) === filter.month)
        .filter((receivable) => {
          if (!query) return true;
          return [
            receivable.sourceType, receivable.sourceDocumentNo,
            receivable.customer, receivable.status, receivable.note
          ].some((value) => normalizeText(value).toLowerCase().includes(query));
        })
        .slice()
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || b.id - a.id)
        .map(copyReceivable);
    }

    function listPayables(options) {
      const filter = Object.assign({ query: "", status: "", month: "" }, options);
      const query = normalizeText(filter.query).toLowerCase();
      return getPayables()
        .filter((payable) => !filter.status || payable.status === filter.status)
        .filter((payable) => !filter.month || payable.dueDate.slice(0, 7) === filter.month)
        .filter((payable) => {
          if (!query) return true;
          return [
            payable.sourceType, payable.sourceDocumentNo,
            payable.supplier, payable.status, payable.note
          ].some((value) => normalizeText(value).toLowerCase().includes(query));
        })
        .slice()
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || b.id - a.id)
        .map(copyPayable);
    }

    function listPayments(options) {
      const filter = Object.assign({ query: "", direction: "", month: "" }, options);
      const query = normalizeText(filter.query).toLowerCase();
      return getPayments()
        .filter((payment) => !filter.direction || payment.direction === filter.direction)
        .filter((payment) => !filter.month || payment.date.slice(0, 7) === filter.month)
        .filter((payment) => {
          if (!query) return true;
          const target = payment.targetType === "receivable"
            ? getReceivables().find((item) => item.id === payment.targetId)
            : getPayables().find((item) => item.id === payment.targetId);
          return [
            payment.direction, payment.targetType, payment.method, payment.note,
            target && target.sourceDocumentNo,
            target && (target.customer || target.supplier)
          ].some((value) => normalizeText(value).toLowerCase().includes(query));
        })
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
        .map(copyPayment);
    }

    function financeSummary(options) {
      const filter = Object.assign({ month: "" }, options);
      const receivableRows = getReceivables()
        .filter((item) => item.status !== "voided")
        .filter((item) => !filter.month || item.dueDate.slice(0, 7) === filter.month);
      const payableRows = getPayables()
        .filter((item) => item.status !== "voided")
        .filter((item) => !filter.month || item.dueDate.slice(0, 7) === filter.month);
      const paymentRows = getPayments()
        .filter((item) => item.status !== "voided")
        .filter((item) => !filter.month || item.date.slice(0, 7) === filter.month);
      return {
        receivableTotal: receivableRows.reduce((sum, item) => sum + item.amount, 0),
        receivablePaid: receivableRows.reduce((sum, item) => sum + item.paidAmount, 0),
        receivableBalance: receivableRows.reduce((sum, item) => sum + item.amount - item.paidAmount, 0),
        payableTotal: payableRows.reduce((sum, item) => sum + item.amount, 0),
        payablePaid: payableRows.reduce((sum, item) => sum + item.paidAmount, 0),
        payableBalance: payableRows.reduce((sum, item) => sum + item.amount - item.paidAmount, 0),
        cashIn: paymentRows.filter((item) => item.direction === "in").reduce((sum, item) => sum + item.amount, 0),
        cashOut: paymentRows.filter((item) => item.direction === "out").reduce((sum, item) => sum + item.amount, 0)
      };
    }

    function reduceReceivableForReturn(returnRow) {
      const amount = returnRow.quantity * returnRow.unitPrice;
      setReceivables(getReceivables().map((receivable) => {
        if (receivable.sourceDocumentNo !== returnRow.sourceDocumentNo || receivable.status === "voided") {
          return receivable;
        }
        const nextAmount = Math.max(0, receivable.amount - amount);
        const nextPaidAmount = Math.min(receivable.paidAmount, nextAmount);
        return Object.assign({}, receivable, {
          amount: nextAmount,
          paidAmount: nextPaidAmount,
          status: financeStatus(nextAmount, nextPaidAmount),
          note: appendNote(receivable.note, `Return ${returnRow.documentNo}`),
          relatedDocumentNos: mergeDocumentNos(receivable.relatedDocumentNos, [returnRow.sourceDocumentNo, returnRow.documentNo])
        });
      }));
    }

    function reducePayableForReturn(returnRow) {
      const amount = returnRow.quantity * returnRow.unitPrice;
      setPayables(getPayables().map((payable) => {
        if (payable.sourceDocumentNo !== returnRow.sourceDocumentNo || payable.status === "voided") {
          return payable;
        }
        const nextAmount = Math.max(0, payable.amount - amount);
        const nextPaidAmount = Math.min(payable.paidAmount, nextAmount);
        return Object.assign({}, payable, {
          amount: nextAmount,
          paidAmount: nextPaidAmount,
          status: financeStatus(nextAmount, nextPaidAmount),
          note: appendNote(payable.note, `Return ${returnRow.documentNo}`),
          relatedDocumentNos: mergeDocumentNos(payable.relatedDocumentNos, [returnRow.sourceDocumentNo, returnRow.documentNo])
        });
      }));
    }

    function voidReceivablesForDocument(documentNo, voidInfo) {
      setReceivables(getReceivables().map((receivable) =>
        receivable.sourceDocumentNo === documentNo
          ? Object.assign({}, receivable, {
            status: "voided",
            voidReason: voidInfo.voidReason,
            voidedAt: voidInfo.voidedAt,
            voidedBy: voidInfo.voidedBy,
            sourceDocumentNo: receivable.sourceDocumentNo || documentNo,
            relatedDocumentNos: mergeDocumentNos(receivable.relatedDocumentNos, [documentNo])
          })
          : receivable
      ));
    }

    function voidPayablesForDocument(documentNo, voidInfo) {
      setPayables(getPayables().map((payable) =>
        payable.sourceDocumentNo === documentNo
          ? Object.assign({}, payable, {
            status: "voided",
            voidReason: voidInfo.voidReason,
            voidedAt: voidInfo.voidedAt,
            voidedBy: voidInfo.voidedBy,
            sourceDocumentNo: payable.sourceDocumentNo || documentNo,
            relatedDocumentNos: mergeDocumentNos(payable.relatedDocumentNos, [documentNo])
          })
          : payable
      ));
    }

    function hasReceivableForDocument(documentNo) {
      return getReceivables().some((item) => item.sourceDocumentNo === documentNo);
    }

    function hasPayableForDocument(documentNo) {
      return getPayables().some((item) => item.sourceDocumentNo === documentNo);
    }

    return {
      addReceivable, addPayable, addPayment,
      applyPaymentToTarget,
      listReceivables, listPayables, listPayments,
      financeSummary,
      reduceReceivableForReturn, reducePayableForReturn,
      voidReceivablesForDocument, voidPayablesForDocument,
      hasReceivableForDocument, hasPayableForDocument
    };
  }

  global.ClaudeOpenStockFlowStoreFinance = { createFinanceModule };

  if (typeof module !== "undefined") {
    module.exports = global.ClaudeOpenStockFlowStoreFinance;
  }
})(typeof window !== "undefined" ? window : globalThis);
